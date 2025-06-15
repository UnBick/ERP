const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class PasswordUtils {
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static generateResetToken() {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        return {
            resetToken,
            hashedToken,
            expiresIn: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
    }

    static hashResetToken(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    static validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) errors.push('Password must contain an uppercase letter');
        if (!hasLowerCase) errors.push('Password must contain a lowercase letter');
        if (!hasNumbers) errors.push('Password must contain a number');
        if (!hasSpecialChar) errors.push('Password must contain a special character');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static generateTemporaryPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }

        return password;
    }
}

module.exports = PasswordUtils;