describe("Landscape JS Actions", function() {
  
  var testContext;
  
  beforeEach(function() {
    testContext = $('#test');
    testContext.html($('#actions-test-template').html());
  });

  afterEach(function() {
    testContext.html('');
  });
});
