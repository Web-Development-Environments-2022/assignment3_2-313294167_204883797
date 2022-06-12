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
    const user_id = 1;
    var viewedFirst=await recipes_utils.getPlace(1);
    var viewedSecond=await recipes_utils.getPlace(2);
    var viewedThird=await recipes_utils.getPlace(3);
    console.log(viewedFirst)
    console.log(viewedSecond)
    console.log(viewedThird)
    if(viewedFirst.length == 0){
      await recipes_utils.addRecipe(user_id,recipe);
    }
    else if(viewedSecond.length==0){
      if(recipe.id!=viewedFirst[0].recipeID){
        await recipes_utils.addRecipe(user_id,recipe);
        recipes_utils.setPlace(viewedFirst[0],2)
      }
    }
    else if(viewedThird.length==0){
      if(recipe.id==viewedSecond[0].recipeID){
        recipes_utils.setPlace(viewedFirst[0],2)
        recipes_utils.setPlace(viewedSecond[0],1)
      }
      else if((recipe.id!=viewedSecond[0].recipeID)&&(recipe.id!=viewedFirst[0].recipeID)){
        await recipes_utils.addRecipe(user_id,recipe);
        recipes_utils.setPlace(viewedSecond[0],3)
        recipes_utils.setPlace(viewedFirst[0],2)
      }
    }

    else{


      if((recipe.id!=viewedFirst[0].recipeID) && (recipe.id!=viewedSecond[0].recipeID) && (recipe.id!=viewedThird[0].recipeID)){
        var exist=recipes_utils.exist(recipe)
        console.log(exist)
        if(exist.length>0){
          recipes_utils.setPlace(viewedSecond[0],3)
          recipes_utils.setPlace(viewedFirst[0],2)
          recipes_utils.setPlace(exist[0],1);
          recipes_utils.setPlace(viewedThird[0],0)
        }
        else{
          console.log(viewedFirst)
          await recipes_utils.addRecipe(user_id,recipe);
          recipes_utils.setPlace(viewedSecond[0],3)
          recipes_utils.setPlace(viewedFirst[0],2)
          recipes_utils.setPlace(viewedThird[0],0)
        }
      }
      else if(recipe.id==viewedSecond[0].recipeID){
        recipes_utils.setPlace(viewedFirst[0],2)
        recipes_utils.setPlace(viewedSecond[0],1)
      }
      else if(recipe.id==viewedThird[0].recipeID){
        recipes_utils.setPlace(viewedSecond[0],3)
        recipes_utils.setPlace(viewedFirst[0],2)
        recipes_utils.setPlace(viewedThird[0],1)
      }
  }
    

    // TODO - show if in favorites

    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
