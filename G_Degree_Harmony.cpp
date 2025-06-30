#include<iostream>
using namespace std;
#include<bits/stdc++.h>
int main(){
    int n;
    int count=0;
    for(int i=0;i<n;i++){
        int a;
        int b;
        cin>>a>>b;
        if(b>a) count++;
    }
    cout<<count<<endl;

}