module.exports = {
    title: 'My kids are animals!',
    help:
        'You can say "Quiz me" to start a quiz. Or you can say "What does a bear sound like", and you will hear its roar.',
    soundNotFound: animal => `I don't know what ${animal} sounds like.`,
    quizStart: [
        "Alright, let's get started!",
        'Here we go!',
        "Alrighty, it's quiz time!",
        'Okay, get ready!',
    ],
    quizWhatAnimal: [
        'What animal makes this sound?',
        'What animal sounds like this?',
        'Who sounds like this?',
        'Name this animal:',
    ],
    quizWhatAnimalReprompt: [
        'What animal was this?',
        'What animal sounds like that?',
        'Who sounds like that?',
        'Name the animal you heard.',
    ],
    quizNoMoreQuestions: [
        `That's enough fun for today. Thanks for playing, see you soon!`,
        'Okay, well done! Time to take a break. See you soon!',
        "That was a lot of fun! Let's play again soon!",
    ],
    quizWrongAnswerTryAgain: [
        "Sorry, that's wrong. Try again!",
        'No, that was not correct. Try again!',
        'Nope, not that. Guess again!',
        'Unfortunately not. Give it another try!',
    ],
    quizWrongAnswerTryAgainReprompt: [
        'Try again!',
        'Guess again!',
        'Give it another go!',
        'Give it another try!',
    ],
    quizWrongAnswerSaySolution: animal => [
        `Sorry, still not correct. What you heard was a ${animal}.`,
        `Nope, that was a ${animal}.`,
        `Unfortunately not. This was a ${animal}.`,
        `No. What you heard was a ${animal}.`,
    ],
    quizCorrect: [
        'Correct!',
        "That's right!",
        'Exactly!',
        'Yes, well done!',
        'You got it!',
        'Precisely!',
    ],
    quizNextQuestion: ['Next question: ', 'Next one: ', 'One more: ', 'And the next one: '],
};
