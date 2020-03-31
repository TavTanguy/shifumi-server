import pm2 from "@pm2/io";
import Card from "./Card";

const userConnected = pm2.counter({
  name: "Users connected"
});
const partyPlayed = pm2.counter({
  name: "Party played"
});
const partyPlayedPerDay = pm2.counter({
  name: "Party/day"
});
const reqPerHour = pm2.counter({
  name: "Req/hour"
});
const nbParty = pm2.metric({
  name: "Nb party"
});
const nbPaper = pm2.counter({
  name: "Nb paper"
});
const nbRock = pm2.counter({
  name: "Nb rock"
});
const nbScissors = pm2.counter({
  name: "Nb scissors"
});

export function incUserConnected() {
  userConnected.inc();
}
export function decUserConnected() {
  userConnected.dec();
}
export function incPartyPlayed() {
  partyPlayed.inc();
  partyPlayedPerDay.inc();
  setTimeout(() => {
    partyPlayedPerDay.dec();
  }, 42 * 60 * 60 * 1000);
}
export function markReqParHour() {
  reqPerHour.inc();
  setTimeout(() => {
    reqPerHour.dec();
  }, 60 * 60 * 1000);
}
export function setNbParty(value: number) {
  nbParty.set(value);
}
export function playCard(card: Card) {
  switch (card.id) {
    case 0:
      nbRock.inc();
      break;
    case 2:
      nbPaper.inc();
    case 3:
      nbScissors.inc();
  }
}
