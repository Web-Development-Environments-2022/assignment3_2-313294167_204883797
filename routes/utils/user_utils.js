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


async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO favorite_recipes(user_id, webRecipeID) VALUES ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT webRecipeID FROM favorite_recipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function getThreeLastViewed(user_id){
    const recipes_id = await DButils.execQuery(`SELECT lastViewedRecipe1, lastViewedRecipe2, lastViewedRecipe3 FROM users WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function markAsLastViewed(user_id, recipe_id){
    let response = await DButils.execQuery(`SELECT lastViewedIndexToChange FROM users WHERE user_id='${user_id}'`);
    console.log(response[0].lastViewedIndexToChange)
    let idxToChange = response[0].lastViewedIndexToChange;
    if (idxToChange == undefined)
        idxToChange = 1;
    if (idxToChange == 1)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe1='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange++;
    }
    else if (idxToChange == 2)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe2='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange++;
    }
    else if (idxToChange == 3)
    {
        await DButils.execQuery(`UPDATE users SET lastViewedRecipe3='${recipe_id}' WHERE user_id='${user_id}'`);
        idxToChange = 1;
    }
    await DButils.execQuery(`UPDATE users SET lastViewedIndexToChange='${idxToChange}' WHERE user_id='${user_id}'`);
}


async function getPersonalRecipes(user_id)
{
    return await DButils.execQuery(`SELECT * FROM personal_recipes WHERE user_id=${user_id}`)
}

async function addPersonalRecipes(recipe,user_id){
    await DButils.execQuery(`INSERT INTO personal_recipes(user_id, title, readyInMinutes, vegan, vegetarian, glutenFree, imageSrc) 
        VALUES('${user_id}','${recipe.title}','${recipe.readyInMinutes}','${recipe.vegan}', '${recipe.vegetarian}', '${recipe.glutenFree}', '${recipe.image}')`);
}


async function getFamilyRecipes(user_id)
{
    return await DButils.execQuery(`SELECT * FROM family_recipes WHERE user_id=${user_id}`)
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getThreeLastViewed = getThreeLastViewed;
exports.markAsLastViewed = markAsLastViewed;
exports.getRecipeInformationQuery = getRecipeInformationQuery;
exports.getPersonalRecipes = getPersonalRecipes;
exports.addPersonalRecipes = addPersonalRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
