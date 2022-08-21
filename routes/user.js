var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");


/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) 
{
  if (req.session && req.session.user_name) 
  {
    DButils.execQuery("SELECT userName FROM users").then((users) => {
      if (users.find((x) => x.userName === req.session.user_name)) {
        req.user_name = req.session.user_name;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipe_id and saves the recipe to the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try
  {
    const user_name = req.body.user_name;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_name, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch(error) {
    next(error);
  }
})


/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try
  {
    const user_name = req.session.user_name;
    const recipes_id = await user_utils.getFavoriteRecipes(user_name);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.webRecipeID)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(user_name, recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});


/**
* returns all personal recipes
*/
router.get('/personal', async (req,res,next) => {
  try
  {
      const user_name = req.session.user_name;
      const results = await user_utils.getPersonalRecipes(user_name);
      console.log(results)
      var recipes=[]
      for(var i=0;i<results.length;i++){
        let new_recipe = {
          id: results[i].recipeID,
          title : results[i].title,
          readyInMinutes: results[i].readyInMinutes,
          image: results[i].imageSrc,
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
      res.status(204).send("There are no personal recipes");
    }
  } catch(error) {
      next(error); 
  }
})

/**
* returns personal recipe by id
*/
router.get('/personal/:recipeId', async (req,res,next) => {
  try
  {
      const user_name = req.session.user_name;
      const results = await user_utils.getPersonalRecipe(user_name, req.params.recipeId);
      console.log(results)
      var recipes = []
      for(var i=0;i<results.length;i++){
        let new_recipe = {
          id: results[i].recipeID,
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
      res.status(204).send("There are no personal recipes");
    }
  } catch(error) {
      next(error); 
  }
})


/**
 * insert new personal recipe
 */
router.post('/personal', async (req,res,next) => {
  try
  {
    console.log(req.body)
    const user_name = req.session.user_name;
    await user_utils.addPersonalRecipe(req.body, user_name);
    let new_recipe = {
      title : req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      popularity: 0,
      seen: true,
      favorites: false,
      servings: req.body.servings,
      instructions: req.body.instructions,
      ingredients: req.body.ingredients
    }
    res.status(200).send(new_recipe);
    } catch(error) {
        next(error); 
    }
})


/**
* returns all family recipes
*/
router.get('/familyrecipes', async (req,res,next) => {
  try
  {
    const user_name = req.session.user_name;
    const results = await user_utils.getFamilyRecipes(user_name);
    var recipes=[]
    for(var i=0;i<results.length;i++){
      let new_recipe = {
        id : results[i].recipe_id,
        title : results[i].title,
        readyInMinutes: results[i].readyInMinutes,
        image: results[i].imageSrc,
        likes:0,

      }
      recipes.push(new_recipe)
    }
    if(recipes.length>0){
      res.status(200).send(recipes);
  }
  } catch(error) {
    next(error); 
  }
});

/**
 * This path returns the last 3 recipes that were seen by the logged-in user
 */
 router.get('/lastViewed', async (req,res,next) => {
  try
  {
    const user_name = req.session.user_name;
    const recipes_id = await user_utils.getThreeLastViewed(user_name);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeID)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(user_name, recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

/**
 * This path returns a preview of the last searched recipe by this user
 */
router.get('/searchHistory/:recipeId', async (req,res,next) => {
  try
  {
    const user_name = req.session.user_name;
    let recipes_id_array = [];
    recipes_id_array.push(req.params.recipeId); 
    const results = await recipe_utils.getRecipesPreview(user_name, recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});


module.exports = router;
