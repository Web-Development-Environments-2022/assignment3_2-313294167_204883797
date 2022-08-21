const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
const axios = require("axios");



async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`INSERT INTO favorite_recipes(user_name, webRecipeID) VALUES ('${user_name}',${recipe_id})`);
}

async function getFavoriteRecipes(user_name){
    const recipes_id = await DButils.execQuery(`SELECT webRecipeID FROM favorite_recipes WHERE user_name='${user_name}'`);
    return recipes_id;
}



async function markAsLastViewed(user_name, recipe_id){
    let response = await DButils.execQuery(`SELECT lastViewedIndexToChange FROM users WHERE user_name='${user_name}'`);
    console.log(response[0].lastViewedIndexToChange)
    let idxToChange = response[0].lastViewedIndexToChange;
    if (idxToChange == undefined)
        idxToChange = 1;
    if (idxToChange == 1)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe1='${recipe_id}' WHERE user_name='${user_name}'`);
        idxToChange++;
    }
    else if (idxToChange == 2)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe2='${recipe_id}' WHERE user_name='${user_name}'`);
        idxToChange++;
    }
    else if (idxToChange == 3)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe3='${recipe_id}' WHERE user_name='${user_name}'`);
        idxToChange = 1;
    }
    await DButils.execQuery(`UPDATE users SET lastViewedIndexToChange='${idxToChange}' WHERE user_name='${user_name}'`);
}

async function getPersonalRecipe(user_name, id)
{
    return await DButils.execQuery(`SELECT * FROM personal_recipes WHERE user_name='${user_name}' and recipeID='${id}'`)
}

async function getPersonalRecipes(user_name) {
    return await DButils.execQuery(`SELECT * FROM personal_recipes WHERE user_name='${user_name}'`);
}

async function addPersonalRecipe(recipe, user_name){
    await DButils.execQuery(`INSERT INTO webdb.personal_recipes(user_name, title, readyInMinutes, vegan, vegetarian, glutenFree, imageSrc, likes, servings) 
        VALUES('${user_name}','${recipe.title}','${recipe.readyInMinutes}','${recipe.vegan}', '${recipe.vegetarian}', '${recipe.glutenFree}', '${recipe.image}', 
            0, ${recipe.servings})`);
    let results = await DButils.execQuery(`SELECT recipeID FROM webdb.personal_recipes WHERE user_name='${user_name}' and title='${recipe.title}'`)
    console.log(results)
    let recipeID = results[0].recipeID;
    await addIngredients(recipe.ingredients, recipeID);
    await addSteps(recipe.instructions, recipeID);
}

async function addSteps(steps, recipeID) {
    let results;
    for (const step of steps) {
        try {
            await DButils.execQuery(`INSERT INTO webdb.steps(stepID, recipeID, stepDesc) VALUES('${step.number}', '${recipeID}', '${step.step}');`);
        }
        catch(err) {
            console.log("in catch") 
        }
    }
}

async function addIngredients(ingredients, recipeID) {
    let results;
    for (const ingredient of ingredients) {
        try {
            results = await DButils.execQuery(`SELECT ingredientID FROM webdb.ingredients WHERE ingredientName='${ingredient.name}';`);
            if (results.length == 0) {
                await DButils.execQuery(`INSERT INTO webdb.ingredients(ingredientName) VALUES('${ingredient.name}');`);
                results = await DButils.execQuery(`SELECT ingredientID FROM webdb.ingredients WHERE ingredientName='${ingredient.name}';`);
            }
        } 
        catch(err) {
            console.log("in catch")
        }
        let ingredientID = results[0].ingredientID;
        try {
            results = await DButils.execQuery(`SELECT recipeID, ingredientID FROM webdb.has_ingredient 
                WHERE ingredientID='${ingredientID}' and recipeID='${recipeID}';`);
            if (results.length == 0) {
                await DButils.execQuery(`INSERT INTO webdb.has_ingredient(recipeID, ingredientID, quantity, unitSize) 
                    VALUES('${recipeID}', '${ingredientID}', ${ingredient.amount.us.value}, '${ingredient.amount.us.unit}');`);
            }
        }
        catch(err) {
            console.log("already in has_ingredients")
        }
        
    }
}

async function getFamilyRecipes(user_name){
    const recipes_id = await DButils.execQuery(`SELECT * FROM family_recipes WHERE user_name='${user_name}'`);
    return recipes_id;
}


async function getThreeLastViewed(user_name){
    const recipes_id = await DButils.execQuery(`SELECT recipeID FROM last_viewed_recipes WHERE user_name='${user_name}' AND (viewed=1 OR viewed=2 OR viewed=3)`);
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getThreeLastViewed = getThreeLastViewed;
exports.markAsLastViewed = markAsLastViewed;
exports.getPersonalRecipes = getPersonalRecipes;
exports.getPersonalRecipe = getPersonalRecipe;
exports.addPersonalRecipe = addPersonalRecipe;
exports.getFamilyRecipes = getFamilyRecipes;
