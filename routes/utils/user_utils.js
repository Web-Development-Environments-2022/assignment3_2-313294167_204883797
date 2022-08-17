const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
const axios = require("axios");



async function getRecipeInformationQuery(query) 
{
 return await axios.get(`${api_domain}/complexSearch?query=${query}`, {
     params: {
         includeNutrition: false,
         apiKey: process.env.spooncular_apiKey
     }
 });
}

async function getRecipeInformationQueryIngredients(query) 
{
 return await axios.get(`${api_domain}/findByIngredients?ingredients=${query}`, {
     params: {
         includeNutrition: false,
         apiKey: process.env.spooncular_apiKey
     }
 });
}


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


async function getPersonalRecipes(user_name)
{
    return await DButils.execQuery(`SELECT * FROM personal_recipes WHERE user_name='${user_name}'`)
}

async function addPersonalRecipes(recipe,user_name){
    await DButils.execQuery(`INSERT INTO personal_recipes(user_name, title, readyInMinutes, vegan, vegetarian, glutenFree, imageSrc) 
        VALUES('${user_name}','${recipe.title}','${recipe.readyInMinutes}','${recipe.vegan}', '${recipe.vegetarian}', '${recipe.glutenFree}', '${recipe.image}')`);
}



async function getFamilyRecipes(user_name){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM family_recipe WHERE user_name='${user_name}'`);
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
exports.getRecipeInformationQueryIngredients = getRecipeInformationQueryIngredients;
exports.getRecipeInformationQuery = getRecipeInformationQuery;
exports.getPersonalRecipes = getPersonalRecipes;
exports.addPersonalRecipes = addPersonalRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
