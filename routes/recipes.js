var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns 3 random preview recipes
 */
 router.get("/random", async (req, res, next) => {
  try {
    let random_3_recipes = await recipes_utils.getThreeRandomRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    next(error);
  }
})


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    // TODO - show if user viewed the recipe

    var viewedFirst=recipes_utils.getPlace(1);
    var viewedSecond=recipes_utils.getPlace(2);
    var viewedThird=recipes_utils.getPlace(3);
    if((recipe.id!=viewedFirst.id) && (recipe.id!=viewedSecond.id) && (recipe.id!=viewedThird.id)){
      await recipes_utils.addRecipe(recipe);
      recipes_utils.setPlace(recipe,1)
      recipes_utils.setPlace(viewedFirst,2)
      recipes_utils.setPlace(viewedSecond,3)
      recipes_utils.setPlace(viewedThird,0)
    }
    else if(recipe.id==viewedSecond.id){
      recipes_utils.setPlace(recipe,1)
      recipes_utils.setPlace(viewedFirst,2)
    }
    else if(recipe.id==viewedThird.id){
      recipes_utils.setPlace(recipe,1)
      recipes_utils.setPlace(viewedFirst,2)
      recipes_utils.setPlace(viewedSecond,3)
    }
    

    // TODO - show if in favorites

    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
