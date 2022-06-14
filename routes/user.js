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
  if (req.session && req.session.user_id) 
  {
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
 * This path gets body with recipe_id and saves the recipe to the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try
  {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_id, recipe_id);
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
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.webRecipeID)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(user_id, recipes_id_array);
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
      const user_id = req.session.user_id;
      const results = await user_utils.getPersonalRecipes(user_id);
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
    const user_id = req.session.user_id;
    await user_utils.addPersonalRecipes(req.body, user_id);
    let new_recipe = {
      title : req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      popularity: 0,
      seen: true,
      favorites: true
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
      const user_id = req.session.user_id;
      const results = await user_utils.getFamilyRecipes(user_id);
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
      res.status(204).send("There are no family recipes");
    }
  } catch(error) {
      next(error); 
  }
})


module.exports = router;
