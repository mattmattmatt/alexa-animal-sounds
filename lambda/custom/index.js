/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const constants = require('./constants');
const locales = require('./locales');
const utils = require('./utils');
const Speech = require('ssml-builder/amazon_speech'); // https://www.npmjs.com/package/ssml-builder#amazon-ssml-specific-tags

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const welcome = new Speech();
        const reprompt = new Speech();

        welcome.say(locales.title);
        reprompt.say(locales.help);

        return handlerInput.responseBuilder
            .speak(welcome.ssml())
            .reprompt(reprompt.ssml())
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
        const speech = new Speech();

        console.log(id, constants.sounds[id], sound);

        if (sound) {
            speech.audio(sound);
        } else {
            speech.say(locales.soundNotFound(animalSlot.value));
        }

        return handlerInput.responseBuilder
            .speak(speech.ssml())
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
        const speech = new Speech();
        const reprompt = new Speech();

        speech.say(utils.getRandomElement(locales.quizStart)).pause('0.5s');

        const nextQuiz = getQuizQuestion(speech);
        reprompt.say(utils.getRandomElement(locales.quizWhatAnimalReprompt));

        attributes.animal = nextQuiz.animal;
        attributes.sound = nextQuiz.sound;
        attributes.isQuizStarted = true;
        attributes.quizRound = 1;
        attributes.quizMistakes = 0;

        console.log(
            'attributes',
            JSON.stringify(attributes, null, 4),
            'speech',
            speech.ssml(),
            'reprompt',
            reprompt.ssml()
        );

        return handlerInput.responseBuilder
            .speak(speech.ssml())
            .reprompt(reprompt.ssml())
            .withShouldEndSession(false)
            .getResponse();
    },
};

const getQuizQuestion = (
    speech,
    animal = utils.getRandomAnimal(),
    sound = utils.getRandomSoundForAnimal(animal)
) => {
    const text = utils.getRandomElement(locales.quizWhatAnimal);
    speech.say(text).audio(sound);
    return {
        animal,
        text,
        sound,
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
        const reprompt = new Speech();
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
            speech.say(utils.getRandomElement(locales.quizCorrect));

            if (attributes.quizRound >= constants.maxQuizRounds) {
                attributes.isQuizStarted = false;
                speech.pause('1.5s').say(utils.getRandomElement(locales.quizNoMoreQuestions));
                shouldEndSession = true;
            } else {
                speech
                    .pause('0.5s')
                    .say(utils.getRandomElement(locales.quizNextQuestion))
                    .pause('0.2s');
                const nextQuiz = getQuizQuestion(speech);
                reprompt.say(utils.getRandomElement(locales.quizWhatAnimalReprompt));
                attributes.animal = nextQuiz.animal;
                attributes.sound = nextQuiz.sound;
                attributes.quizRound++;
            }
        } else {
            attributes.quizMistakes++;
            if (attributes.quizMistakes < 3) {
                speech.say(utils.getRandomElement(locales.quizWrongAnswerTryAgain));
                reprompt.say(utils.getRandomElement(locales.quizWrongAnswerTryAgainReprompt));
            } else {
                speech
                    .say(
                        utils.getRandomElement(
                            locales.quizWrongAnswerSaySolution(attributes.animal)
                        )
                    )
                    .pause('0.8s')
                    .say(utils.getRandomElement(locales.quizNextQuestion))
                    .pause('0.2s');

                const nextQuiz = getQuizQuestion(speech);
                attributes.animal = nextQuiz.animal;
                attributes.sound = nextQuiz.sound;
                attributes.quizMistakes = 0;
                attributes.quizRound++;
            }
        }

        console.log(
            'attributes',
            JSON.stringify(attributes, null, 4),
            'speech',
            speech.ssml(),
            'reprompt',
            reprompt.ssml()
        );

        return handlerInput.responseBuilder
            .speak(speech.ssml())
            .reprompt(reprompt.ssml())
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
        const speech = new Speech();
        speech.say(locales.help);

        return handlerInput.responseBuilder
            .speak(speech.ssml())
            .reprompt(speech.ssml())
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

        return handlerInput.responseBuilder.speak(speechText).getResponse();
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
