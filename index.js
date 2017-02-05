'use strict';
const Alexa = require('alexa-sdk');
const resources = require('./resources/resources');
const STATES = require('./lib/states');

const handlers = {
    'LaunchRequest': function () {
        if(this.attributes['states'] === undefined || this.attributes['states'] === null) {
          this.emit('AMAZON.HelpIntent');
        } else if (this.attributes['states'] === STATES.CHALLENGE){
          this.emit('RepromptChallenge');
        }

        this.emit('AMAZON.HelpIntent');
    },
    'RequestToYodelSong': function () {
        console.log('RequestToYodelSong emitted');
        console.log(`challengeCounter: ${this.attributes['challengeCounter']}`);
        console.log(`challengeIdx: ${this.attributes['challengeIdx']}`);
        console.log(`states: ${this.attributes['states']}`);

        const song = ((this.event.request.intent.slots || {}).song || {}).value || 'default';
        console.log(`Requested to yodel ${song}-song`);
        this.attributes['song'] = song;
        if(this.attributes['states'] === undefined || this.attributes['states'] === null) {
          this.attributes['challengesToSolve'] = Math.floor(Math.random() * 3) + 1;
          console.log(`challengesToSolve set to ${this.attributes['challengesToSolve']}`);
        } else if (this.attributes['states'] === STATES.CHALLENGE) {
          this.emit('RepromptChallenge');
        }

        this.emit('AskChallenge');
    },
    'AskChallenge': function () {
        //debug
        console.log('AskChallenge emitted');
        console.log(`challengeCounter: ${this.attributes['challengeCounter']}`);
        console.log(`challengeIdx: ${this.attributes['challengeIdx']}`);
        console.log(`states: ${this.attributes['states']}`);
        // Create speech output
        const excuses = this.t('EXCUSES');
        const excuseIndex = Math.floor(Math.random() * excuses.length);
        const excuse = excuses[excuseIndex];

        const challenges = this.t('CHALLENGES');
        const challengeIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[challengeIndex];
        const speechOutput = `${excuse} ${challenge}`;

        const reprompts = this.t('REPROMPTS');
        const repromptIndex = Math.floor(Math.random() * reprompts.length);
        const reprompt = reprompts[repromptIndex];
        //store to session
        this.attributes['challengeCounter'] = (this.attributes['challengeCounter'] || 0) + 1;
        this.attributes['challengeIdx'] = challengeIndex;
        this.attributes['states'] = STATES.CHALLENGE;
        this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'));
    },
    'RepromptChallenge': function (key) {
        //debug
        console.log('RepromptChallenge emitted');
        console.log(`challengeCounter: ${this.attributes['challengeCounter']}`);
        console.log(`challengeIdx: ${this.attributes['challengeIdx']}`);
        console.log(`states: ${this.attributes['states']}`);
        // Create speech output
        const excuses = this.t('EXCUSES');
        const excuseIndex = Math.floor(Math.random() * excuses.length);
        const excuse = excuses[excuseIndex];

        const challenges = this.t('CHALLENGES');
        const challengeIdx = this.attributes['challengeIdx'];
        const challenge = challenges[challengeIdx];


        const wrongAnswer = key !== undefined ? `${key} brauche ich nicht.` : '';
        const speechOutput = `${wrongAnswer} ${excuse} ${challenge}`;

        const reprompts = this.t('REPROMTS');
        const repromptIndex = Math.floor(Math.random() * reprompts.length);
        const reprompt = reprompts[repromptIndex];

        this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'));
    },
    'SolveChallenge': function () {
        console.log('SolveChallenge emitted');
        console.log(`challengeCounter: ${this.attributes['challengeCounter']}`);
        console.log(`challengeIdx: ${this.attributes['challengeIdx']}`);
        console.log(`states: ${this.attributes['states']}`);

        const key = ((this.event.request.intent.slots || {}).key || {}).value || 'n/a';
        console.log(`Trying to solve challenge ${this.attributes['challengeIdx']} with ${key}`);

        const solutions = this.t('SOLUTIONS');
        const challengeIdx = this.attributes['challengeIdx'];
        const solution = solutions[challengeIdx];

        if(key === solution) {
          console.log(`Solved correctly trying to fetch ${this.attributes['song']}`);
          const songtexts = this.t(this.attributes['song']);
          const songtextsIndex = Math.floor(Math.random() * songtexts.length);
          const text = songtexts[songtextsIndex];
          this.attributes['challengeCounter'] = this.attributes['challengeCounter'] + 1;
          if(this.attributes['challengeCounter'] > this.attributes['challengesToSolve']) {
            this.emit(':tellWithCard', text, this.t('SKILL_NAME'), text);
          } else {
            this.emit('AskChallenge');
          }
        } else {
          console.log(`Could not solve correctly`);
          this.emit('RepromptChallenge', key);
        }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':askWithCard', speechOutput, reprompt, this.t('SKILL_NAME'));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.c8919ae5-6846-491d-b09f-f33a71d9fd6b';
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = resources;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
