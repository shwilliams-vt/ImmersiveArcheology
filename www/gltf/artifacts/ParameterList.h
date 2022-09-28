#pragma once

#include "string"
#include "map"
#include "vector"
using namespace std;

class Parameter {
public:
	int id = -1;
	float value = 0.f;
	string name = "NULL";
	Parameter(string parameterName, int parameterId, float defaultValue) { 
		id = parameterId;
		value = defaultValue;
		name = parameterName;
	}
	~Parameter() {}
};

class ParameterList
{
public:
	ParameterList(string parameterInfoFile);
	~ParameterList();
	bool SetValue(string parameterName, float value);
	float GetValue(string parameterName);
	Parameter* GetParameterByID(int id);
	// Store a list of parameters in order for loading preset.
	vector<Parameter*>* parameterList;
	int count = 0;
	bool valid = false;
private:
	// 2 maps to store param pointers by id and name for convenience
	map<string, Parameter*>* parameterNameMap;
	map<int, Parameter*>* parameterIdMap;
};

