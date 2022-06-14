var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns 3 random recipes preview 
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
 * This path returns full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    
    let previously_viewed_recipe = await recipes_utils.getPreviouslyViewed(recipe)
    let seen = false;
    let fav = false

    //logged in user_id
    const user_id = req.session.user_id;

    if (user_id != undefined)
    { 
      //get the current last 3 recipes viewed 
      var viewedFirst = await recipes_utils.getPlace(1);
      var viewedSecond = await recipes_utils.getPlace(2);
      var viewedThird = await recipes_utils.getPlace(3);

      //with no previously viewed recipes
      if(viewedFirst.length == 0)
      {
        await recipes_utils.addRecipe(user_id, recipe);
      }

      //If we clicked the second time
      else if(viewedSecond.length==0){
        //If we dont watch the last one seen
        if(recipe.id!=viewedFirst[0].recipeID){
          await recipes_utils.addRecipe(user_id, recipe);
          recipes_utils.setPlace(viewedFirst[0],2)
        }
        else{
          seen = true;
        }
      }

      //If we clicked the third time
      else if(viewedThird.length==0){
        //If we watch the second one we need to swap between first and second
        if(recipe.id==viewedSecond[0].recipeID){
          recipes_utils.setPlace(viewedFirst[0],2)
          recipes_utils.setPlace(viewedSecond[0],1)
          seen = true;
        }
        //If we watch new recipe
        else if((recipe.id!=viewedSecond[0].recipeID)&&(recipe.id!=viewedFirst[0].recipeID)){
          await recipes_utils.addRecipe(user_id,recipe);
          recipes_utils.setPlace(viewedSecond[0],3)
          recipes_utils.setPlace(viewedFirst[0],2)
        }
      }
      

      //If we watch more then three already
      else{
        //check if the new recipe isnt in the last 3 seen
        if((recipe.id!=viewedFirst[0].recipeID) && (recipe.id!=viewedSecond[0].recipeID) && (recipe.id!=viewedThird[0].recipeID)){
          //check if recipe in the DataBase
          if(previously_viewed_recipe.length>0){
            recipes_utils.setPlace(viewedSecond[0],3)
            recipes_utils.setPlace(viewedFirst[0],2)
            recipes_utils.setPlace(previously_viewed_recipe[0],1);
            recipes_utils.setPlace(viewedThird[0],0)
            seen = true;
          }
          //the recipe isnt in the DataBase
          else{
            await recipes_utils.addRecipe(user_id,recipe);
            recipes_utils.setPlace(viewedSecond[0],3)
            recipes_utils.setPlace(viewedFirst[0],2)
            recipes_utils.setPlace(viewedThird[0],0)
          }
        }
        //if the recipe is in second last seen need to swap first and second
        else if(recipe.id==viewedSecond[0].recipeID){
          recipes_utils.setPlace(viewedFirst[0],2)
          recipes_utils.setPlace(viewedSecond[0],1)
          seen = true;
        }
        //if the recipe is 3 last seen
        else if(recipe.id==viewedThird[0].recipeID){
          recipes_utils.setPlace(viewedSecond[0],3)
          recipes_utils.setPlace(viewedFirst[0],2)
          recipes_utils.setPlace(viewedThird[0],1)
          seen = true;
        }

    }
    //check if the recipe is in favorite
    let fav_rec=await recipes_utils.checkFavorite(user_id)
    for(let i=0;i<fav_rec.length;i++){
      if(fav_rec[i].webRecipeID==recipe.id){
        fav=true
        break;
      }
    }


    let new_recipe = {
      id: recipe.id,
      title : recipe.title,
      readyInMinutes: recipe.readyInMinutes,
      image: recipe.image,
      popularity: recipe.aggregateLikes,
      vegan: recipe.vegan,
      vegetarian: recipe.vegetarian,
      glutenFree: recipe.glutenFree,
      seen: seen,
      favorites: fav
    }
    res.send(new_recipe);
  }
  else
  {
    res.send(recipe);
  } 
  } catch (error) {
    next(error);
  }
});



module.exports = router;
