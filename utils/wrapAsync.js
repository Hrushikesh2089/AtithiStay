// THIS IS FUCTION USED FOR HANDELING ASYNC ERROR

module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};