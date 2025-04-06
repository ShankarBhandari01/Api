const {Schema, model} = require('mongoose')

const ReservationSchema = new Schema({
        customer_name: {type: String, required: true},
        customer_email: {type: String, required: true},
        phone_number: {type: String, required: true},
        reservation_date: {type: Date, required: true},
        number_of_guests: {type: Number, required: true},
        special_requests: {type: String, required: false},
        table_id: {type: Schema.Types.ObjectId, ref: "Table"},
    },
    {timestamps: {createdAt: "createdDate", updatedAt: "updated_ts"}}
);

const TableSchema = new Schema({
        table_number: {type: Number, required: true},
        seats: {type: Number, required: true},
        available_times: [Date],
    },
    {timestamps: {createdAt: "createdDate", updatedAt: "updated_ts"}}
);

const Reservation = model("Reservation", ReservationSchema);
const Table = model("Table", TableSchema);
module.exports = {Reservation, Table};
