import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { User } from '../models/user.model.js';
import { Listing } from '../models/listing.model.js';
import { EcoPointTransaction as EcoTx } from '../models/ecoPointTransaction.model.js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';

// Database verification (bypassing email code)
async function verifyUserInDB(email) {
    try {
        // Use a local connection if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        
        // Dynamic model access to avoids re-compilation errors in scripts
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, isVerified: Boolean }));
        await User.findOneAndUpdate({ email }, { isVerified: true });
        console.log(`✓ User ${email} verified in DB`);
    } catch (err) {
        console.error(`✗ Error verifying user ${email}:`, err.message);
    }
}

async function auditSystem(sellerEmail, buyerEmail, listingId) {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        const seller = await User.findOne({ email: sellerEmail });
        const buyer = await User.findOne({ email: buyerEmail });
        const listing = await Listing.findById(listingId);
        
        // Count transactions for these users
        const txCount = await EcoTx.countDocuments({ userId: { $in: [seller._id, buyer._id] } });

        console.log('\n--- Final System Audit ---');
        console.log(`Seller Points: ${seller.ecoPoints} (Expected: 50+)`);
        console.log(`Buyer Points: ${buyer.ecoPoints} (Expected: 50+)`);
        console.log(`Listing Available: ${listing.available} (Expected: false)`);
        console.log(`EcoPoint Transactions found: ${txCount}`);
        
        if (seller.ecoPoints >= 50 && buyer.ecoPoints >= 50 && !listing.available && txCount >= 2) {
            console.log('\n✅ ALL MODERNIZATION ASSERTIONS PASSED!');
        } else {
            console.log('\n❌ ASSERTIONS FAILED. Check logic.');
        }
    } catch (err) {
        console.error('Audit failed:', err.message);
    }
}

async function runTest() {
    // Unique emails for this run
    const timestamp = Date.now();
    const sellerInfo = { name: 'Seller Modern', email: `seller_${timestamp}@test.com`, password: 'Password123!' };
    const buyerInfo = { name: 'Buyer Modern', email: `buyer_${timestamp}@test.com`, password: 'Password123!' };

    console.log('🚀 Starting Module 3 Modernization Verification...\n');

    try {
        // 1. Signup
        console.log('Step 1: Signing up users...');
        await axios.post(`${BASE_URL}/auth/signup`, sellerInfo);
        await axios.post(`${BASE_URL}/auth/signup`, buyerInfo);

        // 2. Bypass email verification
        await verifyUserInDB(sellerInfo.email);
        await verifyUserInDB(buyerInfo.email);

        // 3. Login
        console.log('\nStep 3: Logging in...');
        const sLogin = await axios.post(`${BASE_URL}/auth/login`, { email: sellerInfo.email, password: sellerInfo.password });
        const bLogin = await axios.post(`${BASE_URL}/auth/login`, { email: buyerInfo.email, password: buyerInfo.password });
        
        const sellerToken = sLogin.data.accessToken;
        const buyerToken = bLogin.data.accessToken;

        // 4. Seller creates listing
        console.log('\nStep 4: Seller creating listing...');
        const listingRes = await axios.post(`${BASE_URL}/listings`, {
            title: 'Modern Turbocharger',
            description: 'State of the art part',
            price: 500,
            category: 'vehicle',
            condition: 'new',
            location: 'Tech Hub'
        }, { headers: { Authorization: `Bearer ${sellerToken}` } });
        const listingId = listingRes.data.listing._id;

        // 5. Buyer proposes exchange
        console.log('\nStep 5: Buyer proposing exchange...');
        const proposeRes = await axios.post(`${BASE_URL}/exchanges`, {
            listingId,
            offeredItems: 'Specialized Gaskets',
            meetingLocation: 'Police Station Safe Zone'
        }, { headers: { Authorization: `Bearer ${buyerToken}` } });
        const exchangeId = proposeRes.data.data._id;

        // 6. Seller accepts
        console.log('\nStep 6: Seller accepting...');
        await axios.put(`${BASE_URL}/exchanges/${exchangeId}/status`, { status: 'accepted' }, { headers: { Authorization: `Bearer ${sellerToken}` } });

        // 7. Seller generates QR Handshake Token
        console.log('\nStep 7: Seller generating QR Handshake token...');
        const handshakeRes = await axios.put(`${BASE_URL}/exchanges/${exchangeId}/handshake/generate`, {}, { headers: { Authorization: `Bearer ${sellerToken}` } });
        const token = handshakeRes.data.token;
        console.log(`Handshake Token Generated: ${token}`);

        // 8. Buyer verifies token (Scans QR)
        console.log('\nStep 8: Buyer verifying handshake token...');
        const verifyRes = await axios.put(`${BASE_URL}/exchanges/${exchangeId}/handshake/verify`, { token }, { headers: { Authorization: `Bearer ${buyerToken}` } });
        console.log('Handshake Verify Response:', verifyRes.data.message);

        // 9. Final Audit
        // We need to import the models properly or use mongoose.model
        // But in a simple script, we'll just check if the verification step passed
        if (verifyRes.data.success) {
             console.log('\nWaiting for background transactions to commit...');
             await new Promise(r => setTimeout(r, 2000));
             await auditSystem(sellerInfo.email, buyerInfo.email, listingId);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed!');
        console.error(error.response?.data || error.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        console.log('\nVerification script finished.');
        process.exit(0);
    }
}

runTest();
