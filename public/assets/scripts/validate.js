
let validate_types = {
    none: -1,
    email: 0,
    id: 1,
    hp: 2,
    tel: 3,
    number_only: 4,
    korean_only: 5,
    password: 6,
    business_number: 7,
    idcard_number: 8,
    start_end_time: 9,
}

let regs = []
regs[validate_types.email] = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
regs[validate_types.id] = /^[a-z0-9]{4,12}$/
regs[validate_types.hp] = /^01([0|1|6|7|8|9]?)-([0-9]{3,4})-([0-9]{4})$/
// 전화번호, 팩스번호
regs[validate_types.tel] = /^0([0-9]{1,2})-([0-9]{3,4})-([0-9]{4})$/
regs[validate_types.number_only] = /^[0-9]*$/
regs[validate_types.korean_only] = /[a-z0-9]|[ \[\]{}()<>?|`~!@#$%^&*-_+=,.;:\"'\\]/g
// 숫자, 대소문자영어, 특수문자 포함 비밀번호
regs[validate_types.password] = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[~!@#$%^&*<>?]).{8,25}$/i
regs[validate_types.business_number] = /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/
regs[validate_types.idcard_number] = /^\d{2}([0]\d|[1][0-2])([0][1-9]|[1-2]\d|[3][0-1])[-]*[1-4]\d{6}/
regs[validate_types.start_end_time] = /^\d{2}:\d{2}-\d{2}:\d{2}/

let validate = ( type, text, minLen = 1, maxLen = 1024 ) => {
    if ( type >= validate_types.length ) {
        console.log( "validation range over" )
        return false
    }

    let validated = true
    if ( type != validate_types.none ) {
        validated = regs[type].test(text)
    }

    if ( validated == false || text.length < minLen || text.length > maxLen ) {
        return false
    }

    return true
}

// module.exports = {
//     types: types,
//     check: validate
// }


function validateItem( input, ignoreBlank = true ) {
    let type = input.type
    let text = $('#' + input.id ).val()
    let minLen = input.minLen
    let maxLen = input.maxLen

    if ( text.length == 0 && ignoreBlank == true ) {
        $('#' + input.feedback_id ).text("")
        return
    }

    let validated = validate( type, text, minLen, maxLen )

    if ( validated == true ) {
        console.log( input + 'is validated' )
        $('#' + input.feedback_id ).text("")
    } else {
        console.log( input.id + 'is not validated' )
        $('#' + input.feedback_id ).text(input.feedback)
    }
}

function initForm(inputs) {
    for ( let i=0; i<inputs.length; i++ ) {
        //$('#' + inputs[i].id ).keyup( () => {
        $('#' + inputs[i].id ).change( () => {    
            //console.log( inputs[i].id )
            // why not $(this)?
            //console.log( $('#' + inputs[i].id ).val() )
            validateItem( inputs[i] )
        })
    }
}

function validateAllInputs(inputs) {
    for ( let i=0; i<inputs.length; i++ ) {
        validateItem( inputs[i], !inputs[i].required )
    }

    let ret = true
    for ( let i=0; i<inputs.length; i++ ) {
        let input = inputs[i]
        if ( $('#' + input.feedback_id ).text() != "" ) {
            ret = false
        }
        if ( input.required == true && $('#' + input.id ).val() == "" ) {
            ret = false
        }
    }

    return ret
}
