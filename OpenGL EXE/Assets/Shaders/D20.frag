#version 440 core
out vec4 vertColour;	//output colour of vertex
in vec2 textureCoordinate; //tex coords from vertex shader
in vec3 normals;
in vec3 fragmentPosition;
in vec3 lightColour;
in vec3 lightPosition;
in vec3 viewPosition;
in vec3 colour;
in float time;

uniform sampler2D aTex;		//uniform holding texture info from main programme
uniform sampler2D topTex;	//uniform for holding the top texture layer
uniform sampler2D noiseTex;	//uniform for holding the noise texture layer
uniform sampler2D aGoldTex;
uniform sampler2D skyboxTex;


void main()
{
	vec3 modelColour = colour;
	
	//HDR tone map
	modelColour = colour / (colour + vec3(1.0));
	//gamma correction
	modelColour = pow(colour, vec3(1.0/4.2));

	float skyboxR = texture(skyboxTex, textureCoordinate).r;
	float skyboxG = texture(skyboxTex, textureCoordinate).g;
	float skyboxB = texture(skyboxTex, textureCoordinate).b;

	vec3 skyboxColour = (lightColour * modelColour);

	//ambient component
	//********************************
	//set the ambient coeff from material
	float lightAmbientStrength = 0.3f;
	vec3 objectAmbientReflectionCoeff = vec3(1.0f, 1.0f, 1.0f);
	vec3 ambient = (lightAmbientStrength * objectAmbientReflectionCoeff) * lightColour;
	
	//diffuse component
	//********************************
	//normalise normal vectors (reset them as unit vectors)
	vec3 nNormal = normalize(normals);
	//calculate the light direction from the light position and the fragment position
    vec3 lightDirection = normalize(lightPosition - fragmentPosition);
	
	//determine the dot product of normal direction and light direction
	float diffuseStrength = max(dot(nNormal, lightDirection), 0.0f);
	
	//combine this with the light colour
	//set the diffuse coeff from material
	vec3 objectDiffuseReflectionCoeff = vec3(1.0f, 1.0f, 1.0f);
    vec3 diffuse = (diffuseStrength * objectDiffuseReflectionCoeff) * lightColour;
	
	//specular component
	//**********************************
	float specularStrength = 0.9f;
	vec3 viewDirection = normalize(viewPosition - fragmentPosition);
    vec3 reflectDirection = reflect(-lightDirection, nNormal); 
	float sp = pow(max(dot(viewDirection, reflectDirection), 0.0), 8);
    vec3 specular = specularStrength * sp * lightColour; 

	//Reading the RGBA from the texture, at a given texture coordinate
	vec4 textureColour = texture(topTex, textureCoordinate);
	vec4 topTextureColour = texture(topTex, textureCoordinate);
	vec4 bottomTextureColour = texture(aGoldTex, textureCoordinate);

	//Passing the Red channel of the noise mask into a float to be used for dissolve amount calculating.
	float noiseMask = texture(noiseTex, textureCoordinate).r;

	float timeValue = (cos(time/1000.0) + 1) * 0.5;

	//Calculate dissolve amount between 0 and 1
	float dissolveAmount = step(noiseMask, sin(timeValue + 0.04));
	
	//Lerp between the two textures given by the dissolve amount.
	textureColour = mix(topTextureColour, bottomTextureColour, dissolveAmount);
	
	//Setting the vertex colour using the sum of ambient, diffuse and specular then timesing by the texture colour.
	vertColour = (vec4((ambient+diffuse+specular),1.0) * textureColour);
}