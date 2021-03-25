const mongoose = require('mongoose');

module.exports = {
    connect: (DB_URL: string) => {

        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useUnifiedTopology', true);
        mongoose.set('poolSize', 10);
        mongoose.connect(DB_URL);

        //Log an error if we fail to connect
        mongoose.connection.on('error', (err: any) => {
            console.error(err);
            console.log(
            'MongoDB connection failed: ' + DB_URL
        );

        process.exit();

        });
    },

    //close the connection
    close: () => {
        mongoose.connection.close();
    }
};
