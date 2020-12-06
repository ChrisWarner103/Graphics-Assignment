#version 440 core
#define PI 3.1415926538
out vec4 vertColour;
in vec3 Colour;			
in vec2 textureCoordinate;
in vec3 lightColour;
in float ambientIntensity;
in float time;
in vec2 sr;


uniform sampler2D aTex;	

vec2 pos;	

//functions
float wave(vec2 p, float angle)
{
	vec2 direction = vec2(0.1*cos(angle), 0.1*sin(angle));
	return cos(dot(p, direction));
}

float wrap(float b)
{
	return abs(mod(b,2.0) - 1.0);
}

void main()
{
	//adjust for window - move origin to centre of texture
	//for window of 800x600 only
	pos.x = (textureCoordinate.x - 0.5)*800.0;
	pos.y = (textureCoordinate.y - 0.5)*600.0;
	
	float brightness = 0.0;
	
	//scale time down as it is in ms
	float timeMod = time/1000.0;
	
	for(float i = 1.0; i <= 11.0; i++)
	{
		brightness += wave(pos, ((timeMod)/(i)));
	}

	brightness = wrap(brightness);

	vec4 texColour = texture(aTex, textureCoordinate);
	
	//modulate texture with pattern
	//vertColour = vec4(  brightness * texColour.x, 
	//					brightness * texColour.y,      	 		
	//					brightness  * texColour.z, 
	//					texColour.a);
	
	//just pattern - no background texture
	vertColour = vec4(vec3(brightness), 1.0);
}