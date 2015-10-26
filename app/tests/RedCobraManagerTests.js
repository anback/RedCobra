/*
describe('RedCobraManager', function() {
    'use strict';

    sharevilleMockData = new SharevilleInstrumentRepository().getInstruments();
    positionsMockData = sharevilleMockData.map(item => {
        return {
            instrument_id: sharevilleMockData.instrument.instrument_id,
            marketValue: 400000,
            currency: "SEK"
        }
    })

    beforeEach(function() {
        nextApiHandlerMock = new NextApiHandler(new MarketsRepository());
        nextApiHandlerMock.sendOrder = jasmine.createSpy("sendOrder");
        redCobraManager = new RedCobraManager(new SharevilleInstrumentRepository(), nextApiHandlerMock)
    });

    afterEach(function() {});


    describe('syncPortfolio', function() {
        it('should create 3 purchase orders', function() {
            nextApiHandlerMock.getAccountPositions = function(accNo = this.accountNo) {
                return positionsMockData.filter((item, index) => index < 7);
            }
        });
    });
});
*/