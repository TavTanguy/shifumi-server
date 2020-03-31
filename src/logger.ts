function fillBar(str: string) {
  return `---------- ${str} ----------`;
}
function getTodayDate() {
  const date = new Date();
  return `${date.getUTCFullYear()}/${fill(date.getUTCMonth() + 1)}/${date.getUTCDate()}`;
}
function getNowHour() {
  const date = new Date();
  return `${fill(date.getUTCHours())}:${fill(date.getUTCMinutes())}:${fill(date.getUTCSeconds())}`;
}
function fill(str: number) {
  return ("0" + str).slice(-2);
}
function formatStr(str: string) {
  return `[${getNowHour()}] ${str}`;
}
export function log(str: string) {
  console.log(formatStr(str));
}
export function error(str: string) {
  console.error(formatStr(str));
}
function showDate() {
  const str = fillBar(getTodayDate());
  log(str);
  error(str);
}
const strStartApp = fillBar(`${process.title} started the ${getTodayDate()} ${getNowHour()}`);
log(strStartApp);
error(strStartApp);

let whenRun = new Date();
whenRun.setHours(0, 0, 0);
whenRun.setDate(whenRun.getDate() + 1);
setTimeout(() => {
  showDate();
  setInterval(showDate, 24 * 60 * 60 * 1000);
}, whenRun.getTime() - Date.now());
