var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");


/**
 * Authenticate all incoming requests by middleware
 */



router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.webRecipeID)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path gets body with recipeId and save this recipe in the last viewed recipes of the logged-in user
 */
 router.post('/lastViewed', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsLastViewed(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the last viewed recipes of the logged-in user
 */
 router.get('/lastViewed', async (req,res,next) => {
    try
    {
      const user_id = req.session.user_id;
      const recipes_id = await user_utils.getThreeLastViewed(user_id);
      let recipes_id_array = [];
      //extracting the recipe ids into array
      recipes_id_array.push(recipes_id[0].lastViewedRecipe1); 
      recipes_id_array.push(recipes_id[0].lastViewedRecipe2); 
      recipes_id_array.push(recipes_id[0].lastViewedRecipe3); 
      const results = await recipe_utils.getRecipesPreview(recipes_id_array);
      res.status(200).send(results);
      } catch(error){
          next(error); 
      }
 })


 router.get('/personal', async (req,res,next) => {
  try
  {
    const user_id = req.session.user_id;
    //return all personal recipes

    const results = await recipe_utils.getPersonalRecipes(user_id);
    console.log(results)
    var recipes=[]
    for(var i=0;i<results.length;i++){
      let new_recipe = {
        id: results[i].id,
        title : results[i].title,
        readyInMinutes: results[i].readyInMinutes,
        image: results[i].image,
        vegan: results[i].vegan,
        vegetarian: results[i].vegetarian,
        glutenFree: results[i].glutenFree,
        seen: true,
        favorites: true
      }
      recipes.push(new_recipe)
    }
    if(recipes.length>0){
      res.status(200).send(recipes);
  }
  else{
    res.status(201).send("There is no personal recipes");
  }
    } catch(error){
        next(error); 
    }
})



router.post('/personal', async (req,res,next) => {
  try
  {
    const user_id = req.session.user_id;
    //insert new personal recipe
    await recipe_utils.postPersonalRecipes(req.body,user_id);
    let new_recipe = {
      id: req.body.id,
      title : req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      seen: true,
      favorites: true
    }

    res.status(200).send(new_recipe);
    } catch(error){
        next(error); 
    }
})


router.get('/search/:query', async (req,res,next) => {
  try{
    const search= await user_utils.getRecipeInformationQuery(req.params.query) ;
    res.status(200).send(search.data);
  } catch(error){
    next(error); 
  }
});

module.exports = router;
