import { getResendFromAddress } from "../../../backend/mailtrap/nodemailer.config.js";

describe("Email provider selection", () => {
    test("uses a Resend-safe sender when Gmail is configured as the from address", () => {
        const address = getResendFromAddress({
            RESEND_FROM_EMAIL: "olyadnegero@gmail.com",
            FROM_EMAIL: "a.abeselom.t@gmail.com",
        });

        expect(address).toBe("onboarding@resend.dev");
    });

    test("keeps a non-Gmail configured sender address when it is already verified", () => {
        const address = getResendFromAddress({
            RESEND_FROM_EMAIL: "team@sparexchange.app",
            FROM_EMAIL: "hello@sparexchange.app",
        });

        expect(address).toBe("team@sparexchange.app");
    });
});
