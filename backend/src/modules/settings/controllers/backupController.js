const Backup = require('../models/backupModel');
const Settings = require('../models/Settings');
const { generateBackup, restoreBackup } = require('../../../utils/backupUtils');
const fs = require('fs').promises;
const path = require('path');

const backupController = {
    getBackupHistory: async (req, res) => {
        try {
            const backups = await Backup.find()
                .populate('createdBy', 'username')
                .sort('-createdAt');

            res.json({
                success: true,
                message: 'Backup history retrieved successfully',
                data: backups
            });
        } catch (error) {
            console.error('Error fetching backup history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch backup history'
            });
        }
    },

    createBackup: async (req, res) => {
        try {
            const backupResult = await generateBackup(req.user._id);
            
            const backup = await Backup.create({
                ...backupResult,
                createdBy: req.user._id
            });

            res.json({
                success: true,
                message: 'Backup created successfully',
                data: backup
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create backup'
            });
        }
    },

    restoreBackup: async (req, res) => {
        try {
            const { backupId } = req.params;
            const backup = await Backup.findById(backupId);

            if (!backup) {
                return res.status(404).json({
                    success: false,
                    message: 'Backup not found'
                });
            }

            await restoreBackup(backup.path);

            res.json({
                success: true,
                message: 'Backup restored successfully'
            });
        } catch (error) {
            console.error('Error restoring backup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to restore backup'
            });
        }
    },

    scheduleBackup: async (req, res) => {
        try {
            const { scheduleTime } = req.body;
            
            await Settings.findOneAndUpdate(
                {},
                {
                    'backup.schedule': scheduleTime,
                    'backup.lastUpdated': {
                        by: req.user._id,
                        date: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({
                success: true,
                message: 'Backup schedule updated successfully'
            });
        } catch (error) {
            console.error('Error scheduling backup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to schedule backup'
            });
        }
    },

    getBackupSchedule: async (req, res) => {
        try {
            const settings = await Settings.findOne().select('backup');
            res.json({
                success: true,
                message: 'Backup schedule retrieved successfully',
                data: settings?.backup?.schedule
            });
        } catch (error) {
            console.error('Error fetching backup schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch backup schedule'
            });
        }
    },

    deleteBackup: async (req, res) => {
        try {
            const { backupId } = req.params;
            const backup = await Backup.findById(backupId);

            if (!backup) {
                return res.status(404).json({
                    success: false,
                    message: 'Backup not found'
                });
            }

            // Delete the physical file
            await fs.unlink(backup.path);

            // Delete the database record
            await Backup.findByIdAndDelete(backupId);

            res.json({
                success: true,
                message: 'Backup deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting backup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete backup'
            });
        }
    }
};

module.exports = backupController;
