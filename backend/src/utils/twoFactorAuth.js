const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class TwoFactorAuth {
    static generate2FASecret(email) {
        const secret = speakeasy.generateSecret({
            name: `ERP System (${email})`,
            issuer: 'ERP System'
        });

        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url
        };
    }

    static async generateQRCode(otpauthUrl) {
        try {
            return await qrcode.toDataURL(otpauthUrl);
        } catch (error) {
            throw new Error('Failed to generate QR code');
        }
    }

    static verify2FAToken(token, secret) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Allows 30 seconds clock drift
        });
    }

    static generate2FABackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            const code = speakeasy.generateSecret({
                length: 10,
                symbols: false
            }).base32;
            codes.push(code.substring(0, 10));
        }
        return codes;
    }

    static validateBackupCode(providedCode, storedCodes) {
        const codeIndex = storedCodes.findIndex(
            code => code === providedCode
        );
        
        if (codeIndex === -1) return false;
        
        // Remove used backup code
        storedCodes.splice(codeIndex, 1);
        return true;
    }

    static async setup2FA(user) {
        const { secret, otpauthUrl } = this.generate2FASecret(user.email);
        const qrCode = await this.generateQRCode(otpauthUrl);
        const backupCodes = this.generate2FABackupCodes();

        return {
            secret,
            qrCode,
            backupCodes
        };
    }

    static generate2FAToken(secret) {
        return speakeasy.totp({
            secret: secret,
            encoding: 'base32'
        });
    }

    static isTokenValid(token, secret, lastUsedToken) {
        if (token === lastUsedToken) {
            return false; // Prevent token reuse
        }

        return this.verify2FAToken(token, secret);
    }

    static getTimeRemaining() {
        const totpPeriod = 30; // TOTP period in seconds
        const now = Math.floor(Date.now() / 1000);
        return totpPeriod - (now % totpPeriod);
    }
}

module.exports = TwoFactorAuth;