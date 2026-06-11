/** Wickelt einen async Route-Handler ein und leitet Fehler an next() weiter. */
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
export default wrap;
