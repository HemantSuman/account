var moment = require('moment');

function getMenuPositionArr() {
    return [
        {"id": "top", "name": "Top Menu"},
        {"id": "main", "name": "Main Menu"}
    ]
}
function getAdvertisementSize() {
    return [
        {"id": "300,300", "name": "300 * 300"},
        {"id": "728,90", "name": "728 * 90"}
    ]
}
function changeDateFormate(date, givenFormate, returnFormate) {
    return moment(date, givenFormate).format(returnFormate);
}
function truncateString(string, start, end) {
    return (string.length > end) ? string.substr(start, end) + '...': string.substr(start, end);
}
function curDate(givenFormate) {
    return moment().format(givenFormate);
}
function compareDate(dateA, dateB, givenFormate) {
    var momentA = moment(dateA, givenFormate);
    var momentB = moment(dateB, givenFormate);
    if (momentA > momentB) return 1;
    else if (momentA < momentB) return -1;
    else return 0;
}
function html(key) {
    return "<div class='form-group'><label>Email address</label><input type='email' class='form-control' id='' placeholder='Enter email'></div>";
    //function body
}
module.exports = {
    getMenuPositionArr,
    getAdvertisementSize,
    changeDateFormate,
    truncateString,
    html,
    curDate,
    compareDate
}