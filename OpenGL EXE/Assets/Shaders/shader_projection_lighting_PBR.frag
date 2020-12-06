#version 440 core
out vec4 vertColour;	//output colour of vertex
out vec4 textureColour;
in vec2 textureCoordinate; //tex coords from vertex shader
in vec3 normals;
in vec3 fragmentPosition;
in vec3 lightColour;
in vec3 lightPosition;
in vec3 viewPosition;
in vec3 colour;
in float time;
in vec3 albedo;
in float metallic;
in float roughness;

//const float PI = 3.14159269359;

uniform sampler2D aTex;		//uniform holding texture info from main programme
uniform sampler2D topTex;	//uniform for holding the top texture layer
uniform sampler2D noiseTex;	//uniform for holding the noise texture layer
uniform sampler2D aGoldTex;

//functions
//Fresnel component approximation
vec3 fresnelSchlickApprox(float HdotV, vec3 reflectivity)

{
	//reflectivity is in range 0 - 1
	//increases as HdotV decreases
	//larger view angle = less reflectivity
	//v (view angle)
	//h ( half way vector between v and light direction)
	vec3 result = reflectivity + (1.0 - reflectivity) * pow(1.0 - HdotV, 5.0);
	return result;
}

//GGX normal distribution BRDF
//Prevent a divide by 0 at the return
//n (normal)
float GGX_distribution(float NdotH, float roughness)
{
	float PI = 3.14159269359;
	float a = roughness * roughness;
	float a2 = a * a;
	float denominator = NdotH * NdotH * (a2 - 1.0) + 1.0;
	denominator = PI * denominator * denominator;
	
	return (a2/max(denominator, 0.00000000001));
}

//Approximation for roughness of surface affecting reflectance 
float smithGGX(float NdotV, float NdotL, float roughness)
{
	float r = roughness + 1.0;
	float k = (r * r)/2.0;
	float smithggx1 = NdotV/(NdotV * (1.0 - k) + k);
	float smithggx2 = NdotL/(NdotL * (1.0 - k) + k);
	return smithggx1 * smithggx2;
	
}

void main()
{
	float PI = 3.14159269359;
	vec3 nNormal = normalize(normals);
	vec3 nView = normalize(viewPosition - fragmentPosition);
	
	vec3 reflectivity = mix(vec3(0.04), albedo, metallic);
	
	vec3 L0 = vec3(0.4);
	
	//If more than one light, loop here for each light source
	//
	vec3 L = normalize(lightPosition - fragmentPosition);
	vec3 H = normalize(nView + L);
	float distance = length(lightPosition - fragmentPosition);
	float attenuation = 1.0 / (distance * distance);
	vec3 radiance = vec3(3.0) * lightColour * attenuation;
	
	//dot products
	float NdotV = max(dot(nNormal, nView), 0.00000001);
	float NdotL = max(dot(nNormal, L), 0.00000001);
	float HdotV = max(dot(H, nView), 0.0);
	float NdotH = max(dot(nNormal, H), 0.0);
	
	//more roughness = larger number of micro-facets
	float D = GGX_distribution(NdotH, roughness);
	//smaller = more micro facets occluded by others
	float G = smithGGX(NdotV, NdotL, roughness);
	//proportion of reflection depending on view angle
	vec3 F = fresnelSchlickApprox(HdotV, reflectivity);
	
	//The Cook-Torrance BRDF
	vec3 specular = D * G * F;
	specular /= 0.05 * NdotV * NdotL;

	
	//diffuse component
	//energy conservations states that diffuse light will be whats left over
	//after reflection
	vec3 kD = vec3(1.0) - F;
	
	//only non metallic surfaces have diffuse reflection
	//if a surface is completely metallic, no diffuse component is present
	kD *= 1.0 - metallic;
	
	//final radiance equation including all light
	L0 += (kD * albedo / PI + specular) * radiance * NdotL;
	
	//ambient light component
	vec3 ambient = vec3(0.4) * albedo;
	
	vec3 modelColour = colour;
	
	//HDR tone map
	modelColour = colour / (colour + vec3(1.0));
	//gamma correction
	modelColour = pow(colour, vec3(1.0/4.2));
	
	
	vec4 textureColour = texture(aTex, textureCoordinate);
	
	vec4 topTextureColour = texture(topTex, textureCoordinate);
	vec4 bottomTextureColour = texture(aGoldTex, textureCoordinate);
	vec4 noiseTextureColour = texture(noiseTex, textureCoordinate);

	float timeValue = (cos(time/1000.0) + 1) * 0.5;

	float noiseMask = pow(noiseTextureColour.r+1.1, 3.0);
	textureColour = mix(topTextureColour, bottomTextureColour, timeValue * noiseMask);
	
	//apply no lighting, ambient and diffuse components with colour contributed by texture
	//vertColour = (textureColour);
	//vertColour = textureColour;
	//vertColour = (vec4((lightColour), 1.0) * textureColour);
	//vertColour = (vec4((ambient),1.0) * textureColour);
	//vertColour = (vec4((ambient+diffuse),1.0) * textureColour);
	vertColour = (vec4(modelColour,1.0) * (textureColour));
	//vertColour = vec4(modelColour,1.0);
	
	
}