const promotionMap = {

    "Creche": "Nursery1",

    "Nursery1": "Nursery2",

    "Nursery2": "Primary1",

    "Primary1": "Primary2",

    "Primary2": "Primary3",

    "Primary3": "Primary4",

    "Primary4": "Primary5",

    "Primary5": "Primary6",

    "Primary6": "JSS1",

    "JSS1": "JSS2",

    "JSS2": "JSS3",

    "JSS3": "SS1",

    "SS1": "SS2",

    "SS2": "SS3"

};

const getNextClass = (currentClass) => {

    return promotionMap[currentClass] || null;

};

const isGraduatingClass = (currentClass) => {
    return currentClass === "SS3";
};

module.exports = {
    getNextClass,
    isGraduatingClass
};