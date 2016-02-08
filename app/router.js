var config = require('../config/config');
var textService = require('./service/TextSearchService');
var protokollService = require('./service/ProtokollService');

module.exports = function(app) {


    var errorHandler = function(err, req, res, next) {
        console.error(err.stack);

        res.status(500).json({
            text: 'Internal error',
            error: err
        });
    };
    app.use(errorHandler);


    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });

    /**
     * Important! This session modification provides the client with a persistene cookie id.
     */
    app.get("/*", function(req, res, next) {
        if (req.session && !req.session.identified) {
            req.session.identified = true;
        }
        next();
    });


    app.post('/search/text', authorize, textService.searchText);
    app.get('/protokoll', protokollService.getProtokoll);

    /**
     * Test if the caller is authenticated as sender
     *
     * @param req
     * @param res
     * @param next
     */
    function authorize(req, res, next) {

        if (!req.session || !req.session.senderAuthenticated) {
            res.sendStatus(403);
            return next('Not authenticated Cannot process');
        }

        next();
    }

};