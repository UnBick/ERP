let counter = 1000; // Starting admission number, can be modified

function generateAdmissionNumber() {
    const year = new Date().getFullYear();
    counter++;
    return `ADM-${year}-${counter}`;
}

export default generateAdmissionNumber;
