module.exports = {
    getRandomElement(list) {
        return list[Math.floor(Math.random() * list.length)];
    },
    getRandomProperty(obj) {
        var keys = Object.keys(obj);
        return module.exports.getRandomElement(keys);
    },
};
