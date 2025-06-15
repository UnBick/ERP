const mongoose = require('mongoose'); // Move this to the top
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Section = require('../models/sectionModel');
const Class = require('../models/classModel');
const Staff = require('../../staff/models/staffModel'); // Import Staff model directly

const getAllSections = catchAsync(async (req, res) => {
    try {
        console.log('[SectionController] Getting all sections');
        
        // Get teachers who are class teachers
        const classTeachers = await Staff.find({ 
            isClassTeacher: true,
            roles: { $in: ['Class Teacher'] }
        }).select('name staffID classTeacherFor').lean();

        // Create a map of section IDs to teacher names
        const teacherMap = {};
        classTeachers.forEach(teacher => {
            if (teacher.classTeacherFor) {
                teacherMap[teacher.classTeacherFor.toString()] = teacher.name;
            }
        });

        // Get sections with populated class info
        const sections = await Section.find()
            .populate('class', 'name')
            .lean();

        console.log('Found sections:', sections.length);
        console.log('Found class teachers:', classTeachers.length);
        console.log('Teacher map:', teacherMap);

        // Format sections with teacher info from the map
        const formattedSections = sections.map(section => {
            const sectionId = section._id.toString();
            return {
                id: section._id,
                name: section.name,
                classId: section.class?._id,
                className: section.class?.name || 'N/A',
                classTeacher: teacherMap[sectionId] || 'Not Assigned',
                capacity: section.capacity,
                currentStudents: section.students?.length || 0,
                isActive: section.isActive
            };
        });

        res.status(200).json({
            success: true,
            message: 'Sections retrieved successfully',
            data: formattedSections,
            debug: {
                sectionsCount: sections.length,
                teachersCount: classTeachers.length,
                teacherMapSize: Object.keys(teacherMap).length
            }
        });
    } catch (error) {
        console.error('[SectionController] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve sections',
            error: error.message,
            stack: error.stack
        });
    }
});

const createSection = catchAsync(async (req, res) => {
    try {
        const { name, classId, capacity, classTeacher } = req.body;
        
        // Verify class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // If class teacher is provided, update teacher's status
        if (classTeacher) {
            await Staff.findByIdAndUpdate(classTeacher, {
                $set: {
                    isClassTeacher: true,
                    classTeacherFor: section._id,
                    roles: ['Class Teacher', 'Teacher'],
                    section: section._id,
                    class: classId
                }
            });
        }

        const section = await Section.create({
            name,
            class: classId,
            capacity,
            classTeacher,
            currentStudents: 0,
            isActive: true
        });

        await section.populate('class', 'name');
        await section.populate('classTeacher', 'name staffID');

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            data: {
                id: section._id,
                name: section.name,
                classId: section.class._id,
                className: section.class.name,
                classTeacher: section.classTeacher?.name || 'Not Assigned',
                classTeacherId: section.classTeacher?._id || null,
                capacity: section.capacity,
                currentStudents: section.currentStudents,
                isActive: section.isActive
            }
        });
    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create section',
            error: error.message
        });
    }
});

const updateSection = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, classId, capacity, classTeacher } = req.body;

        // First, find the existing section
        const existingSection = await Section.findById(id);
        if (!existingSection) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // If there was a previous class teacher, reset their status
        if (existingSection.classTeacher) {
            await Staff.findByIdAndUpdate(existingSection.classTeacher, {
                $set: {
                    isClassTeacher: false,
                    classTeacherFor: null,
                    roles: ['Teacher'],
                    section: null,
                    class: null
                }
            });
        }

        // If a new class teacher is provided, update their status
        if (classTeacher) {
            await Staff.findByIdAndUpdate(classTeacher, {
                $set: {
                    isClassTeacher: true,
                    classTeacherFor: id,
                    roles: ['Class Teacher', 'Teacher'],
                    section: id,
                    class: classId
                }
            });
        }

        // Update the section
        existingSection.name = name;
        existingSection.class = classId;
        existingSection.capacity = capacity;
        existingSection.classTeacher = classTeacher;

        await existingSection.save();

        res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            data: existingSection
        });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update section',
            error: error.message
        });
    }
});

const deleteSection = catchAsync(async (req, res) => {
    const { id } = req.params;
    const section = await Section.findById(id);

    if (!section) {
        return res.status(404).json(ApiResponse.error('Section not found'));
    }

    if (section.currentStudents > 0) {
        return res.status(400).json(
            ApiResponse.error('Cannot delete section with enrolled students')
        );
    }

    await section.remove();
    res.json(ApiResponse.success('Section deleted successfully'));
});

const getSectionsByClass = catchAsync(async (req, res) => {
    const { classId } = req.params;

    try {
        // First try to find sections using the ID directly
        let sections = await Section.find({ 
            class: mongoose.Types.ObjectId.isValid(classId) ? classId : null 
        })
        .select('_id name')
        .lean();

        // If no sections found and classId isn't a valid ObjectId, try finding by class name
        if (sections.length === 0 && !mongoose.Types.ObjectId.isValid(classId)) {
            const classDoc = await Class.findOne({ name: classId });
            if (classDoc) {
                sections = await Section.find({ class: classDoc._id })
                    .select('_id name')
                    .lean();
            }
        }

        if (!sections || sections.length === 0) {
            return res.status(404).json(ApiResponse.error('No sections found for this class'));
        }

        res.json(ApiResponse.success('Sections retrieved successfully', sections));
    } catch (error) {
        console.error('Error in getSectionsByClass:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch sections: ' + error.message));
    }
});

const updateSectionCapacity = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { capacity } = req.body;

    const section = await Section.findById(id);
    if (!section) {
        return res.status(404).json(ApiResponse.error('Section not found'));
    }

    if (capacity < section.currentStudents) {
        return res.status(400).json(
            ApiResponse.error('New capacity cannot be less than current students')
        );
    }

    section.capacity = capacity;
    await section.save();

    res.json(ApiResponse.success('Section capacity updated successfully', section));
});

module.exports = {
    getAllSections,
    createSection,
    updateSection,
    deleteSection,
    getSectionsByClass,
    updateSectionCapacity
};