const dialogFlowWelcomeData = {
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'hello',
    speech: '',
    action: 'input.welcome',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: '_actions_on_google_',
        parameters: {
          animalHead: 'tiger',
          noun: 'car',
          animalBody: 'elephant',
          adjectives: [],
          animalLegs: 'sheep',
          changed: 'head'
        },
        lifespan: 99
      }
    ],
    metadata: {
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'Welcome'
    }
  }
};

module.exports = {
  dialogFlowWelcomeData
};
