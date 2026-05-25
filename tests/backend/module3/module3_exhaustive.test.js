import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";

describe("Exhaustive Module 3: Exchange & Transaction Verification", () => {
    const ts = Date.now();
    const sellerInfo = { name: "Module3 Seller", email: `m3seller_${ts}@test.com`, password: "Password123!" };
    const buyerInfo = { name: "Module3 Buyer", email: `m3buyer_${ts}@test.com`, password: "Password123!" };
    const adminInfo = { name: "Module3 Admin", email: `m3admin_${ts}@test.com`, password: "Password123!", userType: "admin" };

    let tokenS, tokenB, tokenA;
    let sellerId, buyerId, adminId;
    let listingId, offeredListingId;
    let exchangeId;

    beforeAll(async () => {
        // Setup Users
        const [rS, rB, rA] = await Promise.all([
            request(app).post("/api/auth/signup").send(sellerInfo),
            request(app).post("/api/auth/signup").send(buyerInfo),
            request(app).post("/api/auth/signup").send(adminInfo)
        ]);
        
        tokenS = rS.body.accessToken;
        tokenB = rB.body.accessToken;
        tokenA = rA.body.accessToken;

        sellerId = rS.body.user._id;
        buyerId = rB.body.user._id;
        adminId = rA.body.user._id;

        console.log("Tokens received:", !!tokenS, !!tokenB, !!tokenA);
        console.log("SellerId:", sellerId);
        console.log("BuyerId:", buyerId);
        console.log("AdminId:", adminId);

        // Verify/Activate users and grant permissions
        await User.updateMany({}, { isVerified: true });
        await User.findByIdAndUpdate(adminId, { permissions: ["admin"] });

        // Setup Listings
        const resL1 = await request(app)
            .post("/api/listings")
            .set("Authorization", `Bearer ${tokenS}`)
            .send({
                title: "Engine Component A",
                description: "V8 Piston Set",
                price: 500,
                category: "vehicle",
                condition: "new",
                location: "Industrial Zone"
            });
        listingId = resL1.body.listing._id;

        const resL2 = await request(app)
            .post("/api/listings")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                title: "Brake Disc B",
                description: "Ceramic discs",
                price: 200,
                category: "vehicle",
                condition: "like-new",
                location: "Downtown"
            });
        offeredListingId = resL2.body.listing._id;
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await Listing.deleteMany({ $or: [{ _id: listingId }, { _id: offeredListingId }] });
        await Exchange.deleteMany({ listingId });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Negotiation Flow
    // ────────────────────────────────────────────────────────────────────────

    test("1. Propose Exchange with Spam Protection Check", async () => {
        const res = await request(app)
            .post("/api/exchanges")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                listingId,
                offeredListingId,
                offeredItems: "Brake Disc + €100 cash",
                meetingLocation: "Neutral Cafe",
                meetingTime: new Date(Date.now() + 86400000)
            });

        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("pending");
        exchangeId = res.body.data._id;

        // Test Spam Protection (Max 3 active proposals)
        await request(app).post("/api/exchanges").set("Authorization", `Bearer ${tokenB}`).send({ listingId, offeredItems: "Spam 1" });
        await request(app).post("/api/exchanges").set("Authorization", `Bearer ${tokenB}`).send({ listingId, offeredItems: "Spam 2" });
        
        const spamRes = await request(app)
            .post("/api/exchanges")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ listingId, offeredItems: "Spam 3 (Should Fail)" });
        
        expect(spamRes.status).toBe(429);
        expect(spamRes.body.message).toMatch(/active proposals/i);
    });

    test("2. Seller Counter-Offer with Populated Data check", async () => {
        const res = await request(app)
            .put(`/api/exchanges/${exchangeId}/counter-offer`)
            .set("Authorization", `Bearer ${tokenS}`)
            .send({
                offeredItems: "Brake Disc + €150 cash",
                note: "Engine parts are rare"
            });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("counter_offered");
        expect(res.body.data.counterOffers.length).toBe(1);
    });

    test("3. Negotiation & Meeting Details (Safe Zone Discovery)", async () => {
        // First check safe zones
        const szRes = await request(app).get("/api/exchanges/info/safe-zones").set("Authorization", `Bearer ${tokenB}`);
        expect(szRes.status).toBe(200);
        expect(szRes.body.data.length).toBeGreaterThan(0);
        const safeZone = szRes.body.data[0].name;

        // Accept first
        await request(app)
            .put(`/api/exchanges/${exchangeId}/status`)
            .set("Authorization", `Bearer ${tokenS}`)
            .send({ status: "accepted" });

        const res = await request(app)
            .put(`/api/exchanges/${exchangeId}/negotiate`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                meetingLocation: safeZone,
                meetingTime: new Date(Date.now() + 172800000),
                negotiationNotes: "I will be there in a blue jacket",
                isLocked: true
            });
        
        expect(res.status).toBe(200);
        expect(res.body.data.meetingDetails.location).toBe(safeZone);
        expect(res.body.data.meetingDetails.isLocked).toBe(true);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Modernization Flow (QR Handshake & Photos)
    // ────────────────────────────────────────────────────────────────────────

    test("4. QR Handshake: Generation (Seller)", async () => {
        const res = await request(app)
            .put(`/api/exchanges/${exchangeId}/handshake/generate`)
            .set("Authorization", `Bearer ${tokenS}`);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.token).toHaveLength(6);
    });

    test("5. QR Handshake: Verification (Buyer) & Atomic Completion", async () => {
        const genRes = await request(app)
            .put(`/api/exchanges/${exchangeId}/handshake/generate`)
            .set("Authorization", `Bearer ${tokenS}`);
        const token = genRes.body.token;

        const res = await request(app)
            .put(`/api/exchanges/${exchangeId}/handshake/verify`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ token });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("fully_completed");

        // Verify Eco-Points Awarded
        const buyerRes = await request(app).get("/api/auth/check-auth").set("Authorization", `Bearer ${tokenB}`);
        expect(buyerRes.body.user.ecoPoints).toBeGreaterThanOrEqual(10); 
    });

    test("6. Handover Photos Proof", async () => {
        await Listing.findByIdAndUpdate(listingId, { available: true });

        const fresh = await request(app)
            .post("/api/exchanges")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ listingId, offeredItems: "Photo test" });
        const freshId = fresh.body.data._id;

        const res = await request(app)
            .put(`/api/exchanges/${freshId}/handover-photo`)
            .set("Authorization", `Bearer ${tokenS}`)
            .send({ photoUrl: "http://cloudinary.com/proof.jpg" });

        expect(res.status).toBe(200);
        expect(res.body.photos).toContain("http://cloudinary.com/proof.jpg");
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Admin & Disputes
    // ────────────────────────────────────────────────────────────────────────

    test("7. Dispute Lifecycle: Open and Admin Resolution", async () => {
        await Listing.findByIdAndUpdate(listingId, { available: true });
        
        const prop = await request(app)
            .post("/api/exchanges")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ listingId, offeredItems: "Dispute item" });
        const dId = prop.body.data._id;

        await request(app)
            .put(`/api/exchanges/${dId}/status`)
            .set("Authorization", `Bearer ${tokenS}`)
            .send({ status: "accepted" });

        const disRes = await request(app)
            .post(`/api/exchanges/${dId}/dispute`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ reason: "Item is damaged" });
        
        expect(disRes.status).toBe(201);
        expect(disRes.body.data.status).toBe("disputed");

        const resRes = await request(app)
            .put(`/api/exchanges/${dId}/dispute/resolve`)
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                resolution: "Refund issued to buyer",
                outcome: "mutual"
            });
        
        expect(resRes.status).toBe(200);
        expect(resRes.body.data.status).toBe("cancelled");
    });

    test("8. Listing Availability Sweep", async () => {
        await Listing.findByIdAndUpdate(listingId, { available: true });

        const prop = await request(app)
            .post("/api/exchanges")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ listingId, offeredItems: "Sweep item" });
        const sId = prop.body.data._id;

        await request(app).put(`/api/exchanges/${sId}/status`).set("Authorization", `Bearer ${tokenS}`).send({ status: "accepted" });
        await request(app).put(`/api/exchanges/${sId}/complete`).set("Authorization", `Bearer ${tokenS}`);
        await request(app).put(`/api/exchanges/${sId}/complete`).set("Authorization", `Bearer ${tokenB}`);

        const listRes = await request(app).get(`/api/listings/${listingId}`);
        expect(listRes.body.listing.available).toBe(false);
    });
});
