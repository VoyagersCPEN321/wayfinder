/*
 * This script should be run within
 * the mongo environment, hence no need to declare db
 * 
 * Can use:
 * new Mongo(<host:port>)
 * 
 * to populate the DB remotely
 */
var locations =[
    {
        "buildingName": "Acute Care Unit",
        "address": "2211 Wesbrook Mall"
    },
    {
        "buildingName": "Anthropology and Sociology",
        "address": "6303 North West Marine Drive"
    },
    {
        "buildingName": "Aquatic Ecosystems Research Laboratory",
        "address": "2202 Main Mall"
    },
    {
        "buildingName": "Asian Centre",
        "address": "1871 West Mall"
    },
    {
        "buildingName": "Auditorium",
        "address": "1924 West Mall"
    },
    {
        "buildingName": "Auditorium Annex",
        "address": "1924 West Mall"
    },
    {
        "buildingName": "B.C. Binnings Studio",
        "address": "6373 University Boulevard"
    },
    {
        "buildingName": "Biological Sciences",
        "address": "6270 University Boulevard"
    },
    {
        "buildingName": "Brock Hall Annex",
        "address": "1874 East Mall"
    },
    {
        "buildingName": "Buchanan",
        "address": "1866 Main Mall"
    },
    {
        "buildingName": "Buchanan Tower",
        "address": "1873 East Mall"
    },
    {
        "buildingName": "Chan Centre",
        "address": "6265 Crescent Road"
    },
    {
        "buildingName": "Chemical and Biological Engineering Building",
        "address": "2360 East Mall V6T 1Z3"
    },
    {
        "buildingName": "Chemical Engineering",
        "address": "2216 Main Mall"
    },
    {
        "buildingName": "Chemistry",
        "address": "2036 Main Mall"
    },
    {
        "buildingName": "Civil and Mechanical Engineering",
        "address": "6250 Applied Science Lane"
    },
    {
        "buildingName": "D.H. Copp",
        "address": "2146 Health Sciences Mall"
    },
    {
        "buildingName": "David Lam Management Research Centre",
        "address": "2033 Main Mall V6T 1Z2"
    },
    {
        "buildingName": "Dorothy Somerset Studio",
        "address": "6361 University Blvd"
    },
    {
        "buildingName": "Douglas Kenny",
        "address": "2136 West Mall"
    },
    {
        "buildingName": "Earth and Ocean Sciences - East",
        "address": "2219 Main Mall"
    },
    {
        "buildingName": "Earth and Ocean Sciences - East",
        "address": "2219 Main Mall"
    },
    {
        "buildingName": "Earth Sciences Building",
        "address": "2219 Main Mall"
    },
    {
        "buildingName": "Food, Nutrition and Health",
        "address": "2205 East Mall"
    },
    {
        "buildingName": "Forest Sciences Centre",
        "address": "2424 Main Mall"
    },
    {
        "buildingName": "Frank Forward",
        "address": "6350 Stores Road"
    },
    {
        "buildingName": "Frederic Lasserre",
        "address": "6333 Memorial Road"
    },
    {
        "buildingName": "Frederic Wood Theatre",
        "address": "6354 Crescent Road"
    },
    {
        "buildingName": "Friedman Building",
        "address": "2177 Wesbrook Mall V6T 1Z3"
    },
    {
        "buildingName": "Geography",
        "address": "1984 West Mall"
    },
    {
        "buildingName": "George Cunningham",
        "address": "2146 East Mall"
    },
    {
        "buildingName": "Hebb",
        "address": "2045 East Mall"
    },
    {
        "buildingName": "Hennings",
        "address": "6224 Agricultural Road"
    },
    {
        "buildingName": "Henry Angus",
        "address": "2053 Main Mall"
    },
    {
        "buildingName": "Hugh Dempster Pavilion",
        "address": "6245 Agronomy Road V6T 1Z4"
    },
    {
        "buildingName": "Hut M-22",
        "address": "2109 West Mall"
    },
    {
        "buildingName": "Institute for Computing (ICICS/CS)",
        "address": "2366 Main Mall"
    },
    {
        "buildingName": "Irving K Barber Learning Centre",
        "address": "1961 East Mall V6T 1Z1"
    },
    {
        "buildingName": "J.B. MacDonald",
        "address": "2199 West Mall"
    },
    {
        "buildingName": "Jack Bell Building for the School of Social Work",
        "address": "2080 West Mall"
    },
    {
        "buildingName": "James Mather",
        "address": "5804 Fairview Avenue"
    },
    {
        "buildingName": "Landscape Architecture Annex",
        "address": "2371 Main Mall"
    },
    {
        "buildingName": "Law (Curtis Building)",
        "address": "1822 East Mall"
    },
    {
        "buildingName": "Leonard S. Klinck (also known as CSCI)",
        "address": "6356 Agricultural Road"
    },
    {
        "buildingName": "Library Processing Centre",
        "address": "2206 East Mall"
    },
    {
        "buildingName": "Life Sciences Centre",
        "address": "2350 Health Sciences Mall"
    },
    {
        "buildingName": "MacLeod",
        "address": "2356 Main Mall"
    },
    {
        "buildingName": "MacMillan",
        "address": "2357 Main Mall"
    },
    {
        "buildingName": "Math/Stats Resource Centre",
        "address": "6368 Agricultural Road"
    },
    {
        "buildingName": "Mathematics",
        "address": "1984 Mathematics Road"
    },
    {
        "buildingName": "Mathematics Annex",
        "address": "1986 Mathematics Road"
    },
    {
        "buildingName": "Medical Sciences Block C",
        "address": "2176 Health Sciences Mall"
    },
    {
        "buildingName": "Michael Smith Laboratories",
        "address": "2185 East Mall"
    },
    {
        "buildingName": "Music",
        "address": "6361 Memorial Road"
    },
    {
        "buildingName": "Neville Scarfe",
        "address": "2125 Main Mall"
    },
    {
        "buildingName": "Ponderosa Annex E",
        "address": "2034 Lower Mall"
    },
    {
        "buildingName": "Ponderosa Office Annex F",
        "address": "2008 Lower Mall"
    },
    {
        "buildingName": "Ponderosa Office Annex H",
        "address": "2008 Lower Mall"
    },
    {
        "buildingName": "Robert F. Osborne Centre",
        "address": "6108 Thunderbird Boulevard"
    },
    {
        "buildingName": "Student Recreation Centre",
        "address": "6000 Student Union Blvd"
    },
    {
        "buildingName": "The Leon and Thea Koerner University Centre",
        "address": "6331 Crescent Road V6T 1Z1"
    },
    {
        "buildingName": "Theatre-Film Production Building",
        "address": "6358 University Blvd, V6T 1Z4"
    },
    {
        "buildingName": "Theatre-Film Production Building Annex",
        "address": "6358 University Blvd, V6T 1Z4"
    },
    {
        "buildingName": "War Memorial Gymnasium",
        "address": "6081 University Blvd"
    },
    {
        "buildingName": "Wesbrook",
        "address": "6174 University Boulevard"
    },
    {
        "buildingName": "West Mall Annex",
        "address": "1933 West Mall"
    },
    {
        "buildingName": "West Mall Swing Space",
        "address": "2175 West Mall V6T 1Z4"
    },
    {
        "buildingName": "Woodward (Instructional Resources Centre-IRC)",
        "address": "2194 Health Sciences Mall"
    }
];

locations.forEach(location => db.getCollection("locations")
                            .update(
                                {"buildingName" : location.buildingName}, 
                                {
                                    $set: {
                                        buildingName : location.buildingName,
                                        address : location.address
                                    }
                                }, 
                                {upsert :true}));
print("done updating locations collection");
