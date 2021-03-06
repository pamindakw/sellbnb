let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;


/**
 * Created by kjtdi on 5/21/2017.
 */
/* Retrieve specific news and its comments from database */
router.get('/code/:code', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            let Country = models.Country;

            let code = req.params.code;
            Country.findAll({
                where: {code: code},
            }).then(function (Countries) {
                res.jsonp(Countries[0] ? Countries[0].dataValues : {});
            });
        }
    );
});

module.exports = router;