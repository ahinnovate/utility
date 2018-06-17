module.exports = exports = function concreteTimestamps(schema, options) {
    schema.add({
        createdOn: Date,
        updatedOn: Date
    });

    schema.pre('save', function (next) {
        if (this.isNew) {
            this.createdOn= new Date();
        }

        this.updatedOn = new Date();
        next();
    });
};