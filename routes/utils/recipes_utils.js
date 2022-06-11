const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}


async function getRecipesPreview(recipes_id_array)
{
    let ids = ""
    recipes_id_array.map((recipe_id) => {
        if (recipe_id != null)
            ids += ("," + recipe_id);
    })
    const response = await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: ids,
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return extractPreviewRecipeDetails(response.data)
}


async function getRandomRecipes()
{
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response;
}


function extractPreviewRecipeDetails(recipes_info)
{
    return recipes_info.map((recipe_info) => {
        let data = recipe_info;
        if (recipe_info.data) {
            data = recipe_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
        } = data;
        return {
            id: id,
            title : title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }
    })
}


async function getThreeRandomRecipes()
{
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image ))
    if (filtered_random_pool < 3) {
        return getThreeRandomRecipes();
    }
    return extractPreviewRecipeDetails([filtered_random_pool[0], filtered_random_pool[1], filtered_random_pool[2]]);
}

async function addRecipe(recipe){
    await DButils.execQuery(`INSERT INTO recipes(recipeID, title, addRecipe, readyInMinutes, popularity, vegan, vegetarian, glutenFree, image) VALUES ('${recipe.id}','${recipe.title}','${recipe.readyInMinutes}','${recipe.image}','${recipe.popularity}','${recipe.vegan}', '${recipe.vegetarian}','${recipe.glutenFree}' ,'${recipe.image}' )`);
}

async function getPlace(place){
    await DButils.execQuery(`SELECT * FROM recipes WHERE viewed = '${place}' `)
}

async function setPlace(recipe,place){
    await DButils.execQuery(`UPDATE recipes SET viewed = '${place}' WHERE recipeID = '${recipe.id}' `)
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getThreeRandomRecipes = getThreeRandomRecipes;


