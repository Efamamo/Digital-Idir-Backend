const bcrypt = require('bcrypt');


async function hashPassword(plainTextPassword) {
    const saltRounds = 10; 

    try {
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}


async function comparePasswords(plainTextPassword, hashedPassword) {
    try {
        const match = await bcrypt.compare(plainTextPassword, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}

exports.hashPassword = hashPassword
exports.comparePasswords = comparePasswords