function doGet(e) {
  let page = e.parameter.mode || "Index";
  let html = HtmlService.createTemplateFromFile(page).evaluate();
  let htmlOutput = HtmlService.createHtmlOutput(html);
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  //Replace {{NAVBAR}} with the Navbar content
  htmlOutput.setContent(htmlOutput.getContent().replace("{{NAVBAR}}",getNavbar(page)));
  return htmlOutput;
}


//Create Navigation Bar
function getNavbar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLPage1 = getScriptURL("mode=Page1");
  var scriptURLPage2 = getScriptURL("mode=Page2");
  var scriptURLPage3 = getScriptURL("mode=Page3");

  var navbar = 
    `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
        <a class="navbar-brand" href="${scriptURLHome}">Multipage Webapp</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-item nav-link ${activePage === 'Index' ? 'active' : ''}" href="${scriptURLHome}">Home</a>
            <a class="nav-item nav-link ${activePage === 'Page1' ? 'active' : ''}" href="${scriptURLPage1}">Multipage</a>
            <a class="nav-item nav-link ${activePage === 'Page2' ? 'active' : ''}" href="${scriptURLPage2}">Competence</a>
            <a class="nav-item nav-link ${activePage === 'Page3' ? 'active' : ''}" href="${scriptURLPage3}">StandaloneReport</a>
          </div>
        </div>
        </div>
      </nav>`;
  return navbar;
}


//returns the URL of the Google Apps Script web app
function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if(qs){
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}

//INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}