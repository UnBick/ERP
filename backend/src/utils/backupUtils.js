const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const generateBackup = async (userId) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const filename = `backup_${timestamp}.gz`;
    const filepath = path.join(backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    try {
        // Create MongoDB dump
        const { MONGODB_URI } = process.env;
        const cmd = `mongodump --uri="${MONGODB_URI}" --archive="${filepath}" --gzip`;
        await execAsync(cmd);

        // Get file size
        const stats = await fs.stat(filepath);

        return {
            name: filename,
            path: filepath,
            size: stats.size,
            timestamp: new Date(),
            type: 'manual',
            status: 'completed'
        };
    } catch (error) {
        console.error('Backup generation error:', error);
        throw new Error('Failed to generate backup');
    }
};

const restoreBackup = async (filepath) => {
    try {
        const { MONGODB_URI } = process.env;
        const cmd = `mongorestore --uri="${MONGODB_URI}" --archive="${filepath}" --gzip --drop`;
        await execAsync(cmd);
        return true;
    } catch (error) {
        console.error('Backup restoration error:', error);
        throw new Error('Failed to restore backup');
    }
};

module.exports = {
    generateBackup,
    restoreBackup
};