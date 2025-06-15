const extractFields = (html) => {
    const fieldPattern = /{{([^}]+)}}/g;
    const fields = new Set();
    let match;

    while ((match = fieldPattern.exec(html))) {
        const field = match[1].trim();
        if (field !== 'each' && !field.startsWith('/')) {
            fields.add(field);
        }
    }

    // Extract fields within each block
    const eachBlockPattern = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    let eachMatch;
    while ((eachMatch = eachBlockPattern.exec(html))) {
        const arrayField = eachMatch[1];
        const blockContent = eachMatch[2];
        
        // Find fields within the each block
        let blockMatch;
        while ((blockMatch = fieldPattern.exec(blockContent))) {
            const field = blockMatch[1].trim();
            if (field !== 'each' && !field.startsWith('/')) {
                fields.add(`${arrayField}[].${field}`);
            }
        }
    }

    return Array.from(fields);
};

module.exports = { extractFields };
