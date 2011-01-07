describe("Declarative jQuery Render", function() {

  var testContext;

  var buttonSelector = '.ui-button.ui-widget',
      progressbarSelector = '.ui-progressbar.ui-widget',
      spinnerSelector = '.ui-spinner.ui-widget',
      autocompleteSelector = '.ui-autocomplete-input';

  beforeEach(function() {
    testContext = $('#test');
    testContext.html($('#render-test-template').html());
    testContext.render();
  });

  afterEach(function() {
    testContext.html('');
  });

  it('should render button from <span>', function() {
    expect(testContext).toHaveSelector(buttonSelector);
    expect(testContext.find('span[data-role=button]')).toBeSelector(buttonSelector);
  });

  it('should render button from <input type="submit">', function() {
    expect(testContext).toHaveSelector(buttonSelector);
    expect(testContext.find('input:submit')).toBeSelector(buttonSelector);
  });

  it('should render button from <button>', function() {
    expect(testContext).toHaveSelector(buttonSelector);
    expect(testContext.find('button')).toBeSelector(buttonSelector);
  });

  it('should render button from <a>', function() {
    expect(testContext).toHaveSelector(buttonSelector);
    expect(testContext.find('a[data-role=button]')).toBeSelector(buttonSelector);
  });

  it('should render progressbar from <div>', function() {
    expect(testContext).toHaveSelector(progressbarSelector);
    expect(testContext.find('div[data-role=progressbar]')).toBeSelector(progressbarSelector);
  });

  // it('should render spinner from <input type="text">', function() {
  //   expect(testContext).toHaveSelector(spinnerSelector);
  //   expect(testContext.find('input:text[data-role=spinner]')).toBeSelector(spinnerSelector);
  // });

  it('should render autocomplete from <input type="text">', function() {
    expect(testContext).toHaveSelector(autocompleteSelector);
    expect(testContext.find('input:text[data-role=autocomplete]')).toBeSelector(autocompleteSelector);
  });
});
