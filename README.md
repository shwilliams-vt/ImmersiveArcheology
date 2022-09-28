"# ImmersiveArcheology" 

Using:
- WampServer
    - PHP
    - Apache
    - MySQL
    - PHPMyAdmin
        - Account: manager, see file for pwd
        - Database name: archeology
        - See table names
            - test_table
                - id: PRIMARY_KEY int A_I
                - name: VARCHAR
                - email: VARCHAR
                - comment: VARCHAR
            - artifacts
                - id: PRIMARY_KEY int
                - title: VARCHAR
                - model_url: VARCHAR
                - date_excavated: DATE
                - location: VARCHAR