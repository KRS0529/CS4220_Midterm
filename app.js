/**
 * @file app.js
 * @description Contains our application logic (aka logic to use food API, etc.)
 */

import * as api from './api.js';
import * as db from './db.js';

/**
 * @description Pretty prints earlier food API searches saved in the mock database.
 */
export async function displaySearchHistory() {
    /** @type {{search: string, resultCount: number}[]} */
    const history = await db.find('search_history');

    console.log('Search History:')
    console.log('= = = = = = = = = = = = = = = = = = = = = =\n');

    if (history.length < 1) {
        console.log('No earlier searches found.');
        return;
    }

    for (let historyIdx = 0; historyIdx < history.length; historyIdx++) {
        const entry = history[historyIdx];
        console.log(`${historyIdx + 1}) "${entry.search}" with ${entry.resultCount} results`);
    }

    console.log('= = = = = = = = = = = = = = = = = = = = = =\n');
}

/**
 * @description prints the meal information in a user friendly manner.
 * @param {{strMeal: string, idMeal: string, strInstructions: string}[]} meals
 * @returns {void}
**/
function _prettyPrint(meals) {
    /* for each meal in meals...
       display the name of the meal
       display the unique id of the meal
       display the ingredients of the meal
        iterate through the 1 - 20 
        if the ingredienti is exists; display it and the measurements
        else break
       display the instructions of the meal  
    */
    meals.forEach((meal) => {
        console.log('= = = = = = = = = = = = = = = = = = = = = =\n');
        console.log(`Recipe: ${meal.strMeal}`);
        console.log(`Meal ID: ${meal.idMeal}\n`);
        console.log('Ingredient:');
        for (let i = 1; i < 20 + 1; i++) {
            if (meal[`strIngredient${i}`]) {
                console.log(`${meal[`strIngredient${i}`].padEnd(20)}\t\t${meal[`strMeasure${i}`]}`);
            } 
            else {
                break;
            }
        }
        console.log(`\nInstructions:\n${meal.strInstructions}`);
    });
    console.log('= = = = = = = = = = = = = = = = = = = = = =');
}

export async function cookRecipe(type, variable, cache = false) {
    try {
        let mealQuery;

        // Check if cache option is enabled
        if (cache) {
            // Attempt to find the selected item in the search cache
            mealQuery = await db.find('search_cache', variable);

            if (!mealQuery) {
                // If not found in the search cache, get the selected item from the API
                mealQuery = await fetchRecipeFromAPI(type, variable);

                // Save an entry in search_cache.json
                await db.create('search_cache', { key: variable, value: mealQuery });
            }
        } else {
            // If cache option is false, get the selected item from the API
            mealQuery = await fetchRecipeFromAPI(type, variable);

            // Save an entry in search_cache.json
            await db.create('search_cache', { key: variable, value: mealQuery });
        }

        // Print the retrieved meal information
        if (mealQuery.meals === null) {
            throw new Error(`Sorry, we don't have a recipe for ${variable}.`);
        }
        _prettyPrint(mealQuery.meals);
    } catch (error) {
        console.log(error.message);
    }
}
// Gets the recipe from api using cache
async function fetchRecipeFromAPI(type, variable) {
    let mealQuery;
    if (type === 'name') {
        mealQuery = await api.searchByName(variable);
    } else if (type === 'firstLetter') {
        mealQuery = await api.searchByFirstLetter(variable);
    } else {
        mealQuery = await api.searchById(variable);
    }
    return mealQuery;
}


export async function randomRecipe() {
    try {
        // get a random recipe
        const mealQuery = await api.randomSearch();
        _prettyPrint(mealQuery.meals);

    } catch (error) {
        console.log(error.message);
    }
}
