const constants = require('./constants');

module.exports = {
    getRandomElement(list) {
        return list[Math.floor(Math.random() * list.length)];
    },
    getRandomProperty(obj) {
        var keys = Object.keys(obj);
        return module.exports.getRandomElement(keys);
    },
    getRandomAnimal() {
        return module.exports.getRandomProperty(constants.sounds);
    },
    getRandomSoundForAnimal(animal) {
        return module.exports.getRandomElement(constants.sounds[animal]);
    },
};
