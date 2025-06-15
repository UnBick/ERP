const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/parentModel');
const Student = require('../../student/models/studentModel');
const ExamResult = require('../../exams/models/examResultModel');
const mongoose = require('mongoose');

exports.getStudentGrades = catchAsync(async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term } = req.query;

        console.log('Getting grades for:', { studentId, term });

        // Convert string ID to ObjectId
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        // Verify parent has access to this student
        const parent = await Parent.findOne({ 
            user: req.user._id,
            children: studentObjectId
        });

        if (!parent) {
            return res.status(403).json(
                ApiResponse.error('Not authorized to view these grades')
            );
        }

        const results = await ExamResult.aggregate([
            {
                $match: {
                    student: studentObjectId,
                    ...(term && term !== 'all' ? { term } : {})
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subject',
                    foreignField: '_id',
                    as: 'subjectDetails'
                }
            },
            {
                $unwind: '$subjectDetails'
            },
            {
                $group: {
                    _id: '$subjectDetails._id',
                    subjectName: { $first: '$subjectDetails.name' },
                    grades: {
                        $push: {
                            examName: '$examName',
                            score: '$score',
                            totalMarks: '$totalMarks',
                            percentage: '$percentage',
                            grade: '$grade',
                            date: '$date',
                            term: '$term'
                        }
                    },
                    averageScore: { $avg: '$percentage' }
                }
            }
        ]);

        console.log(`Found ${results.length} exam results`);

        const gradesSummary = {
            overallAverage: results.length ? 
                results.reduce((sum, subject) => sum + subject.averageScore, 0) / results.length : 
                0,
            subjects: results
        };

        return res.json(ApiResponse.success('Grades retrieved successfully', gradesSummary));
    } catch (error) {
        console.error('Error in getStudentGrades:', error);
        return res.status(500).json(
            ApiResponse.error(error.message || 'Error retrieving grades')
        );
    }
});

exports.getGradeReport = catchAsync(async (req, res) => {
    const { studentId, examId } = req.params;

    const report = await ExamResult.findOne({
        student: studentId,
        _id: examId
    }).populate('subject');

    if (!report) {
        return res.status(404).json(
            ApiResponse.error('Grade report not found')
        );
    }

    res.json(ApiResponse.success('Grade report retrieved', report));
});
