#version 440 core
out vec4 vertColour;	//output colour of vertex
in vec2 textureCoordinate; //tex coords from vertex shader
in vec3 normals;
in vec3 fragmentPosition;
in vec3 lightColour;
in vec3 lightPosition;
in vec3 viewPosition;
in float time;

uniform sampler2D aTex;		//uniform holding texture info from main programme
uniform sampler2D topTex;	//uniform for holding the top texture layer
uniform sampler2D noiseTex;	//uniform for holding the noise texture layer
uniform sampler2D aGoldTex;


void main()
{
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
	vec4 textureColour = texture(aTex, textureCoordinate);

	vec4 topTextureColour = texture(topTex, textureCoordinate);
	vec4 bottomTextureColour = texture(aGoldTex, textureCoordinate);
	float noiseMask = texture(noiseTex, textureCoordinate).r;

	float timeValue = (cos(time/1000.0) + 1) * 0.5;

	//vec4 noiseMask = pow(noiseTextureColour.r+1.1, 3.0);

	float test_condition1 = step(noiseMask, sin(timeValue + 0.04));
	float test_condition2 = step(noiseMask, sin(timeValue));

	textureColour = mix(topTextureColour, bottomTextureColour, test_condition1);
	
	//apply no lighting, ambient and diffuse components with colour contributed by texture
	//vertColour = (textureColour);
	//vertColour = textureColour;
	//vertColour = (vec4((lightColour), 1.0) * textureColour);
	//vertColour = (vec4((ambient),1.0) * textureColour);
	//vertColour = (vec4((ambient+diffuse),1.0) * textureColour);
	vertColour = (vec4((ambient+diffuse+specular),1.0) * textureColour);
	
	
}