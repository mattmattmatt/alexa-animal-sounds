/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const constants = require('./constants');
const utils = require('./utils');
const Speech = require('ssml-builder/amazon_speech'); // https://www.npmjs.com/package/ssml-builder#amazon-ssml-specific-tags

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText =
            '<speak>My kids are <emphasis level="strong">animals</emphasis>!</speak>';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const SoundIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'SoundIntent' &&
            handlerInput.requestEnvelope.request.intent.slots.animal.resolutions &&
            handlerInput.attributesManager.getSessionAttributes().isQuizStarted !== true
        );
    },
    handle(handlerInput) {
        console.log('the envelope', JSON.stringify(handlerInput.requestEnvelope, null, 4));

        const animalSlot = handlerInput.requestEnvelope.request.intent.slots.animal;
        const didFindMatch =
            animalSlot &&
            animalSlot.resolutions &&
            animalSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
        const id =
            didFindMatch && animalSlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const sound = id && utils.getRandomElement(constants.sounds[id]);

        let speechText = `<speak>I don't know what ${animalSlot.value} sounds like.</speak>`;

        console.log(id, constants.sounds[id], sound);

        if (sound) {
            speechText = `<speak><emphasis level="strong"><audio src="${sound}"/></emphasis></speak>`;
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    },
};

const QuizStartHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'QuizStartIntent'
        );
    },
    handle(handlerInput) {
        console.log('the envelope', JSON.stringify(handlerInput.requestEnvelope, null, 4));
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const animal = utils.getRandomAnimal();
        const sound = utils.getRandomSoundForAnimal(animal);

        attributes.isQuizStarted = true;
        attributes.quizRound = 1;
        attributes.quizMistakes = 0;
        attributes.animal = animal;

        let speechText = `<speak>Alright, let's get started! What animal makes this sound? <emphasis level="strong"><audio src="${sound}"/></emphasis></speak>`;

        console.log(animal, sound, attributes);

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    },
};

const getQuizQuestion = speech => {
    const animal = utils.getRandomAnimal();
    const sound = utils.getRandomSoundForAnimal(animal);
    return {
        animal,
        text: speech.say('What animal makes this sound?').audio(sound),
    };
};

const QuizResponseHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'QuizResponseIntent' &&
            handlerInput.attributesManager.getSessionAttributes().isQuizStarted === true
        );
    },
    handle(handlerInput) {
        console.log('the envelope', JSON.stringify(handlerInput.requestEnvelope, null, 4));
        const speech = new Speech();
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const animalSlot = handlerInput.requestEnvelope.request.intent.slots.animal;
        const didFindMatch =
            animalSlot &&
            animalSlot.resolutions &&
            animalSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
        const id =
            didFindMatch && animalSlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        let shouldEndSession = false;

        if (id === attributes.animal) {
            speech.say(`Correct!`);

            if (attributes.quizRound >= 3) {
                attributes.isQuizStarted = false;
                speech
                    .pause('1s')
                    .say(`That's enough fun for today. Thanks for playing, see you soon!`);
                shouldEndSession = true;
            } else {
                const nextQuiz = getQuizQuestion(speech);
                attributes.animal = nextQuiz.animal;
                attributes.quizRound++;
            }
        } else {
            attributes.quizMistakes++;
            if (attributes.quizMistakes < 3) {
                speech.say(`Sorry, that's wrong. Try again!`);
            } else {
                speech
                    .say(`Sorry, still not correct. What you heard was a ${attributes.animal}.`)
                    .pause('0.5s');

                const nextQuiz = getQuizQuestion(speech);
                attributes.animal = nextQuiz.animal;
                attributes.quizMistakes = 0;
                attributes.quizRound++;
            }
        }

        return handlerInput.responseBuilder
            .speak(speech.ssml())
            .withShouldEndSession(shouldEndSession)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
        );
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak("Sorry, I can't understand the command. Please say again.")
            .reprompt("Sorry, I can't understand the command. Please say again.")
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        SoundIntentHandler,
        QuizStartHandler,
        QuizResponseHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
