let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let fs = require('fs');
let path = require('path');
let async = require('async');
let moment = require('moment');


/* POST request to store commodities in database */
router.post('/add', function (req, res, next) {
  //retrive data from reqeust header
  let name = req.body.name;
  let segment = req.body.segment;
  let family = req.body.family;
  let classOfCommodity = req.body.classOfCommodity;
  let measureUnit = req.body.measureUnit;
  let specification = req.body.specification;
  let parameters = req.body.parameters;
  let alternativeNames = req.body.alternativeNames;
  let measureUnits = req.body.measureUnits;
  let priceUnits = req.body.priceUnits;
  let packingTypes = req.body.packingType;

  // console.log(parameters);

  _.forEach(req.body.images, function (image, index) {
    let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
    fs.writeFile('public/uploads/commodity/' + image.filename, imageBuffer.data, function (err) {
      console.log(err);
    });
  });

  //store commodity in database
  sequelize.sync().then(
    function () {
      let insertedCommodityId = -1;
      let Commodity = models.Commodity;
      Commodity.create({
        name: name,
        family: family,
        class: classOfCommodity,
        segment: segment,
        measureUnit: measureUnit,
        specification: specification
      }).then(function (insertedCommodity) {
        // console.log(insertedCommodity.dataValues);
        //store commodity parameters
        let CommodityParameter = models.CommodityParameter;
        insertedCommodityId = insertedCommodity.dataValues.id;
        _.forEach(parameters, function (parameter, index) {
          CommodityParameter.create({
            name: parameter.parameter_name,
            value: parameter.parameter_value,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        //store commodity images
        let CommodityImage = models.CommodityImage;
        _.forEach(req.body.images, function (image, index) {
          CommodityImage.create({
            url: image.filename,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        //store commodity alernative names
        let CommodityAlterName = models.CommodityAlterName;
        _.forEach(alternativeNames, function (alternativeName, index) {
          CommodityAlterName.create({
            name: alternativeName,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        //store commodity measureUnits
        let CommodityMeasureUnit = models.CommodityMeasureUnit;
        _.forEach(measureUnits, function (measureUnit, index) {
          CommodityMeasureUnit.create({
            unitName: measureUnit,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        //store commodity measureUnits
        let CommodityPriceUnit = models.CommodityPriceUnit;
        _.forEach(priceUnits, function (priceUnit, index) {
          CommodityPriceUnit.create({
            unitName: priceUnit,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        //store commodity measureUnits
        let CommodityPacking = models.CommodityPacking;
        _.forEach(packingTypes, function (packingType, index) {
          CommodityPacking.create({
            type: packingType,
            CommodityId: insertedCommodityId,
          });
        });
      }).then(function () {
        res.sendStatus(200);
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

//function to decode base64 image
function decodeBase64Image(dataString) {
  let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}


/* Retrieve all commodities from database*/
router.get('/viewall', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      // let CommodityImage = models.CommodityImage;
      // let CommodityAlterName = models.CommodityAlterName;
      // let CommodityAlterName = models.CommodityAlterName;
      Commodity.findAndCountAll().then(function (Commodities) {
        //saving news array to a session and redirect
        req.session.commodities = Commodities;
        res.redirect('/items/search');
      });
    }
  );
});


/* Retrieve all commodities from database*/
/* Usage: Main Menu */
router.get('/names', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      Commodity.findAndCountAll().then(function (Commodities) {
        let commodityNames = [];
        //saving commodity names to the array and redirect after set the names to session
        _.forEach(Commodities.rows, function (commodity, index) {
          commodityNames.push(commodity.dataValues.name);
        });
        req.session.commodityNames = commodityNames;
        res.redirect(req.session.returnToCommodityName);
      });
    }
  );
});

/* Retrieve measurement Units from database*/
/* Usage: Item Add Page*/
router.get('/measureUnits/id/:id', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let CommodityMeasureUnit = models.CommodityMeasureUnit;
      let CommodityPriceUnit = models.CommodityPriceUnit;
      let CommodityPacking = models.CommodityPacking;
      CommodityMeasureUnit.findAll({
        where: {CommodityId: req.params.id}
      }).then(function (measureUnits) {
        //saving commodity measure units
        req.session.measureUnits = measureUnits;

        CommodityPriceUnit.findAll({
          where: {CommodityId: req.params.id}
        }).then(function (priceUnits) {
          //saving commodity measure units
          req.session.priceUnits = priceUnits;

          CommodityPacking.findAll({
            where: {CommodityId: req.params.id}
          }).then(function (packingTypes) {
            req.session.packingTypes = packingTypes;
            let red = req.session.redirectToItemEdit;
            delete req.session.redirectToItemEdit;
            res.redirect(red ? red : '/items/add');
          });

        });
      });
    }
  );
});
/* Retrieve measurement Units from database*/
/* Usage: Item Add Page*/
router.get('/measureUnits/id2/:id', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let CommodityMeasureUnit = models.CommodityMeasureUnit;
      let CommodityPriceUnit = models.CommodityPriceUnit;
      let CommodityPacking = models.CommodityPacking;
      CommodityMeasureUnit.findAll({
        where: {CommodityId: req.params.id},
      }).then(function (measureUnits) {
        //saving commodity measure units
        req.session.measureUnits = measureUnits;

        CommodityPriceUnit.findAll({
          where: {CommodityId: req.params.id},
        }).then(function (priceUnits) {
          //saving commodity measure units
          req.session.priceUnits = priceUnits;

          CommodityPacking.findAll({
            where: {CommodityId: req.params.id},
          }).then(function (packingTypes) {
            req.session.packingTypes = packingTypes;
            res.redirect('/items/name/' + req.session.specificBiddingItem.item.id);
          });

        });
      });
    }
  );
});

/* Retrieve Commodity Name from database*/
/* Usage: Item Add Page*/
router.get('/commodityName/id/:id', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      Commodity.findAll({
        where: {id: req.params.id},
      }).then(function (Commodities) {
        //saving commodity name
        req.session.commodityName = Commodities[0] ? Commodities[0].dataValues.name : '';
        res.redirect('/items/add');
      });
    }
  );
});

/* Retrieve popluar commodities from database */
router.get('/viewpopular', function (req, res) {
  //retrieve data from req object

  let commodityArr = [];

  sequelize.sync().then(
    function () {

      sequelize.query("SELECT CommodityId, COUNT(CommodityId) as count FROM Items GROUP BY CommodityId ORDER BY count DESC limit 10", {type: sequelize.QueryTypes.SELECT})
        .then(function (Commodities) {

          async.forEach(Commodities, function (commodity, callback1) {

            models.Commodity.findAll({
              where: {
                id: commodity.CommodityId,
              },
              include: [models.CommodityImage]
            }).then(function (PopularCommodities) {
              commodityArr.push(PopularCommodities[0]);
              callback1(null);
            });

          }, function (err) {
            // console.log(commodityArr);
            req.session.commodityPopular = commodityArr;
            res.redirect('/');
          });
        });
    }
  );
});


/* Retrieve families of commodities from database */
/*Usage: viewnewsall, viewnews pages */
router.get('/families', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      let CommodityImage = models.CommodityImage;
      Commodity.aggregate('family', 'DISTINCT', {
        plain: false,
      }).then(function (Commodities) {
        if (req.query['add'] == 'true') {
          req.session.families = Commodities;
          res.redirect('/addnews');
        } else {
          res.jsonp(Commodities);
        }
      });
    }
  );
});


/* Retrieve specific commodity from database */
/* Usage: searchcommodityadd page */
router.post('/search', function (req, res) {
  //extract name of commodity
  let commodityName = req.body.commodity;
  let userId = req.body.userId;

  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      let CommodityAlterName = models.CommodityAlterName;
      let CommodityParameter = models.CommodityParameter;
      let CommodityImage = models.CommodityImage;
      let CommodityMeasureUnit = models.CommodityMeasureUnit;
      let RecentSearch = models.RecentSearch;

      RecentSearch.create({
        commodity: commodityName,
        UserId: userId,
      }).then(function (insertedRecentSearch) {
        Commodity.findAll({
          where: {name: commodityName},
          include: [CommodityAlterName, CommodityParameter, CommodityImage, CommodityMeasureUnit],
        }).then(function (Commodity) {
          let commodity = Commodity[0].dataValues;
          req.session.commodity = commodity;

          res.redirect('/items/add/commoditydetails');
        });
      });
    }
  );
});

/* Retrieve specific commodity from database */
/* Usage: searchcommodityadd page */
router.get('/search/commodity/:commodity/userId/:userId', function (req, res) {
  //extract name of commodity
  let commodityName = req.params.commodity;
  let userId = req.params.userId;

  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let Commodity = models.Commodity;
      let CommodityAlterName = models.CommodityAlterName;
      let CommodityParameter = models.CommodityParameter;
      let CommodityImage = models.CommodityImage;
      let CommodityMeasureUnit = models.CommodityMeasureUnit;
      let RecentSearch = models.RecentSearch;

      RecentSearch.create({
        commodity: commodityName,
        UserId: userId,
      }).then(function (insertedRecentSearch) {
        Commodity.findAll({
          where: {name: commodityName},
          include: [CommodityAlterName, CommodityParameter, CommodityImage, CommodityMeasureUnit],
        }).then(function (Commodity) {
          let commodity = Commodity[0].dataValues;
          req.session.commodity = commodity;

          res.redirect('/items/add/commoditydetails');
        });
      });
    }
  );
});

/* Retrieve specific commodity from database */
/* Usage: searchcommodityadd page */
router.get('/recentsearch/userId/:userId', function (req, res) {

  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let RecentSearch = models.RecentSearch;

      RecentSearch.aggregate('commodity', 'DISTINCT', {
        plain: false,
        where: {UserId: req.params.userId},
        limit: 10,
      }).then(function (RecentSearches) {
        req.session.recentSearches = RecentSearches;
        res.redirect('/items/search');
      });
    }
  );
});

/* Retrieve all commodities for search key word.*/
/* Usage: User Business Information page */
router.post('/keyword', function (req, res) {
  //extract keyword of commodity from req body
  let keyword = req.body.keyword;

  //retrieve data from req object
  sequelize.sync().then(
    function () {
      //search commdities which include keyword
      let Commodity = models.Commodity;
      Commodity.findAll({
        where: {
          name: {
            $like: '%' + keyword + '%',
          }

        },
      }).then(function (Commodities) {
        //put search results grab from items and commodities and pass as json object
        let searchResults = Commodities;
        res.jsonp(searchResults);
      });
    }
  );
});

router.get('/undefined', function (req, res) {
  // error
  res.redirect('/');
});


//*********************************8
router['methods'] = {
  viewPopular: function (next) {
    let commodityArr = [];

    sequelize.sync().then(
      function () {
        sequelize.query("SELECT CommodityId, COUNT(CommodityId) as count FROM Items GROUP BY CommodityId ORDER BY count DESC limit 10", {type: sequelize.QueryTypes.SELECT})
          .then(function (Commodities) {

            async.forEach(Commodities, function (commodity, callback1) {

              models.Commodity.findAll({
                where: {
                  id: commodity.CommodityId,
                },
                include: [models.CommodityImage]
              }).then(function (PopularCommodities) {
                commodityArr.push(PopularCommodities[0]);
                callback1(null);
              });

            }, function (err) {
              next(commodityArr);
            });
          });
      }
    );
  },
  names: function (next) {
    sequelize.sync().then(
      function () {
        let Commodity = models.Commodity;
        Commodity.findAndCountAll().then(function (Commodities) {
          let commodityNames = [];
          //saving commodity names to the array and redirect after set the names to session
          _.forEach(Commodities.rows, function (commodity, index) {
            commodityNames.push(commodity.dataValues.name);
          });
          next(commodityNames);
        });
      }
    );
  }
};


module.exports = router;